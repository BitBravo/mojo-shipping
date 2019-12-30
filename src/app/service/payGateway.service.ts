import { Injectable } from "@angular/core";
import { GlobalScopeService } from "../service/global-scope.service";
import { ManifestGetService } from "../service/manifest-get.service";

declare var Heartland: any;

@Injectable()

////////// First Data/BAMS //////////////
class PayGatewayBAMS {
    private _globalScope: GlobalScopeService;
    private _onSuccess: any;
    private _onError: any;

    showEmbedPayForm: boolean = true;

    constructor(aGS: any, onSuccess: any, onError: any, manifest: any) {
        this._globalScope = aGS;
        this._onSuccess = onSuccess;
        this._onError = onError;
    }

    init() {
        //do any initalization here

    };
}

////////// TSYS //////////////
class PayGatewayTSYS {
    private _globalScope: GlobalScopeService;
    private _onSuccess: any;
    private _onError: any;
    private _manifestGetService: ManifestGetService;
    // private tsys: any;

    showEmbedPayForm: boolean = true;

    constructor(aGS: any, onSuccess: any, onError: any, manifest: any) {
        this._globalScope = aGS;
        this._onSuccess = onSuccess;
        this._onError = onError;
        this._manifestGetService = manifest;
    }

    init() {
        //Get the manifest and deviceId
        this._manifestGetService.GetManifest().subscribe(response => {  
            console.log(response);
            this._globalScope.MANIFEST = response['manifest'];
            this._globalScope.DEVICE_ID = response['deviceId'];          
            this.generateScript();
        });
    };

    generateScript() {
        var list = document.getElementsByTagName('script');
        var i = list.length, flag = false;
        var baseUrl = "https://gateway.transit-pass.com/transit-tsep-web/jsView/";
        if (this._globalScope.payInfo[0].useCert == true){
            baseUrl = "https://stagegw.transnox.com/transit-tsep-web/jsView/"
        };

        while (i--) {
            if (list[i].src === baseUrl + this._globalScope.DEVICE_ID + "?" + this._globalScope.MANIFEST) {
                flag = true;
                
                var id=document.getElementById('tsys');
                    id.remove();

                var tag = document.createElement('script');
                tag.id="tsys";

                tag.src = baseUrl + this._globalScope.DEVICE_ID + "?" + this._globalScope.MANIFEST;
                document.getElementsByTagName('head')[0].appendChild(tag);
            }
        }
        
        // if we didn't already find it on the page, add it
        if (!flag) {
            var tag = document.createElement('script');
            tag.id="tsys";
            // tag.onload = function() {
            //     this.generateFunction();
            //   }.bind(this);
            tag.src = baseUrl + this._globalScope.DEVICE_ID + "?" + this._globalScope.MANIFEST;
            document.getElementsByTagName('head')[0].appendChild(tag);
        }
    }

    // generateFunction(){
    //     // script text
    //     var txt = "function tsepHandler(eventType, event){ console.log(event); localStorage.setItem('Response', JSON.stringify(event)); };";  
    //     var scriptTag = document.createElement('script');
    //     scriptTag.id="tsysfunction";
    //     //scriptTag.type = 'text/javascript';

    //     // append it in a text node
    //     scriptTag.appendChild(document.createTextNode(txt));
    //     document.getElementsByTagName('head')[0].appendChild(scriptTag);
    // }

    generateToken(cardData: any) {
        var self=this;
        var Response = JSON.parse(localStorage.getItem('Response'));

        if (Response != null || Response != undefined){

        if (Response.responseCode=="A0000" && Response.status=="PASS"){
            localStorage.removeItem('Response');
           self._onSuccess(Response.tsepToken, Response.maskedCardNumber, Response.expirationDate, Response.cardType);
        }
        else{
            localStorage.removeItem('Response');
           self._onError(Response);
        }
      }
      cardData.loading=false;
    }
}

////////// Heartland //////////////
class PayGatewayHLAND {
    private _globalScope: GlobalScopeService;
    private _onSuccess: any;
    private _onError: any;
    private heartland: any;
    showEmbedPayForm: boolean = true;

    constructor(aGS: any, onSuccess: any, onError: any, manifest: any) {
        this._globalScope = aGS;
        this._onSuccess = onSuccess;
        this._onError = onError;
    };

    generateToken(cardData: any) {
        var self = this;

        this.heartland = new Heartland.HPS({
            publicKey: this._globalScope.payInfo[0].pkey,
            cardNumber: cardData.cardNumber.replace("-", ""),
            cardCvv: cardData.cardCVV.toString(),
            cardExpMonth: cardData.cardMonth.toString(),
            cardExpYear: cardData.cardYear.toString(),
            success: function (result) {
                console.log(result);
                var expiration = result.exp_month + result.exp_year;
                self._onSuccess(result.token_value, result.last_four, expiration, result.card_type);
            },
            error: function (error) {
                console.log(error);
                self._onError(error);
            }
        });
        this.heartland.tokenize();
    };

    init() {
        //do any initalization here
        //
    };
}

////////// STRIPE //////////////
class PayGatewaySTRIPE {
    private _globalScope: GlobalScopeService;
    private _onSuccess: any;
    private _onError: any;
    private aStripeHandler: any;
    showEmbedPayForm: boolean = false;

    constructor(aGS: any, onSuccess: any, onError: any, manifest: any) {
        this._globalScope = aGS;
        this._onSuccess = onSuccess;
        this._onError = onError;
    }

    generateToken(cardData: any) {
        var self = this;
        //do any initalization here
        this.aStripeHandler = (<any>window).StripeCheckout.configure({
            key: this._globalScope.payInfo[0].publishable_key,
            locale: 'auto',
            image: this._globalScope.VENDOR_LOGO_URL,
            token: function (token: any) {
                // You can access the token ID with `token.id`.
                // Get the token ID to your server-side code for use.
                console.log(token);
                var expiration = token.card.exp_month.toString() + token.card.exp_year.toString();
                self._onSuccess(token.id, token.card.last4, expiration, token.card.brand);
            },
            closed: function () {
                cardData.loading = false;
            }
        });
        var theAmount = (this._globalScope.getGrandTotal() * 100).toFixed(2); //convert to cents
        this.aStripeHandler.open({
            name: self._globalScope.VENDOR_NAME,
            amount: theAmount,
            email: cardData.order.emailAddress,
            currency: self._globalScope.isoCurrency
            // zipCode: true
        });
    };

    init() {
        //do any initalization here

    };
}

export class PayGatewayFactory {

    //   constructor(private _httpService: HttpService) {
    //   }

    getGatewayInstance(aGlobalScope: GlobalScopeService, onSuccess: any, onError: any, _manifestGetService: ManifestGetService) {
        switch (aGlobalScope.payInfo[0].providerId) {
            case 'BAMS':
                return new PayGatewayBAMS(aGlobalScope, onSuccess, onError, null);
            case 'TSYS':
                return new PayGatewayTSYS(aGlobalScope, onSuccess, onError, _manifestGetService);
            case 'HLAND':
                return new PayGatewayHLAND(aGlobalScope, onSuccess, onError, null);
            case 'STRIPE':
                return new PayGatewaySTRIPE(aGlobalScope, onSuccess, onError, null);
            default:
            //raise an exception
        }
    };
}