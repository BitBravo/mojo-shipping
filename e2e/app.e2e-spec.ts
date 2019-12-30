import { NewMojoOnlineOrdPage } from './app.po';

describe('new-mojo-online-ord App', () => {
  let page: NewMojoOnlineOrdPage;

  beforeEach(() => {
    page = new NewMojoOnlineOrdPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
