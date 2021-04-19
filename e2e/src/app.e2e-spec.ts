import { SessionService } from './../../src/app/services/session.service';
import { environment } from './../../src/environments/environment';
import { Member } from './../../src/app/member/Member';
import { browser, by, element, logging } from 'protractor';
import { AppPage } from './app.po';
import { protractor } from 'protractor/built/ptor';

class MemberInfo implements Member{
  public id: String = ""; 
  public firstName: String = "";
  public lastName: String = "";
  public photoUrl: String = "";
  public position: String = "";
  public email: String = "";
  public phone: String = "";
  public birthday: String = "";
  public leadedProjects: String[] = [];
  public memberProjects: String[] = [];
  public finishedProjects: String[] = [];
  MemberInfo(){

  }
}

describe('workspace-project App', () => {
  let page: AppPage;
  let member1:MemberInfo = new MemberInfo();
  member1.firstName="User 1";
  member1.lastName="Last Name 1";
  member1.email="User1Email@sampleMail.com";
  member1.birthday="12031934";
  member1.phone="+1234567890";

  let member2:MemberInfo = new MemberInfo();
  member2.firstName="User 2";
  member2.lastName="!§$%&//(()=??`´*+~#öäü,.-;:_@€'^°\}][{";
  member2.email="User2Email@sampleMail.com";

  let service:SessionService = new SessionService();
  let status:string;
  

  beforeEach(() => {
    page = new AppPage();
    let subsription = service.myStatus$.subscribe((stat)=>status=stat);
  });

  it('check no project', async () => {
    await page.homePage();

    await element(by.linkText("Projects")).click();
    let noProjectElement = await element(by.css('.col text-center'));
    expect(noProjectElement.getText()).toBe('No Project Here');    

    
  });

  it('check signup 2 users', async () => {
    let member1Pass:string = "asdf";
    const EC = protractor.ExpectedConditions;

    await element(by.linkText('Sign up')).click();
    await browser.wait(EC.presenceOf(element(by.name("Register"))));
    await fillForm(member1,member1Pass);

    await element(by.linkText('Members')).click();
    await browser.wait(EC.presenceOf(element(by.className("card"))));
    let cards = await element.all(by.className("card"));
    expect(await cards.length).toBe(1);

    await element(by.linkText('Sign up')).click();
    await browser.wait(EC.presenceOf(element(by.name("Register"))));
    await fillForm(member2,member1Pass);

    await element(by.linkText('Members')).click();
    await browser.wait(EC.presenceOf(element(by.className("card"))));
    cards = await element.all(by.className("card"));
    expect(await cards.length).toBe(2);
  });

  it('test login', async () =>{
    const EC = protractor.ExpectedConditions;
    const pass = "asdf";

    browser.wait(EC.presenceOf(element(by.id("email-login"))));
    element(by.id("navbarDropdown")).click();
    element(by.id("email-login")).sendKeys(<string>member1.email);
    element(by.id("password-login")).sendKeys(pass);
    await element(by.name("submit-login")).click();

    await browser.wait(EC.presenceOf(element(by.id("profileDropdown"))))
    expect(await element(by.id("profileDropdown")).getText()).toBe(member1.lastName);


  });

  it('test logout', async ()=>{
    const EC = protractor.ExpectedConditions;
    expect(EC.presenceOf(element(by.id("logout-btn")))).toBeTrue;
    await element(by.id("logout-btn")).click();
    expect(EC.presenceOf(element(by.linkText("Sign up")))).toBeTrue;
  });

  async function fillForm(member:Member, pass:string){
    await element(by.name("Register")).click();
    expect((await element.all(by.className("form-control is-invalid"))).length).toBe(5);

    element(by.id('birthday*')).sendKeys(<string> member.birthday);
    await element(by.name("Register")).click();
    expect((await element.all(by.className("form-control is-invalid"))).length).toBe(5);

    element(by.id('lastName*')).sendKeys(<string> member.lastName);
    await element(by.name("Register")).click();
    expect((await element.all(by.className("form-control is-invalid"))).length).toBe(4);

    element(by.id('firstName*')).sendKeys(<string> member.firstName);
    await element(by.name("Register")).click();
    expect((await element.all(by.className("form-control is-invalid"))).length).toBe(3);

    element(by.id('password2')).sendKeys(pass + 'x');
    await element(by.name("Register")).click();
    expect((await element.all(by.className("form-control is-invalid"))).length).toBe(3);

    element(by.id('phone')).sendKeys(<string> member.phone);

    element(by.id('password1')).sendKeys(pass);
    await element(by.name("Register")).click();
    expect((await element.all(by.className("form-control is-invalid"))).length).toBe(2);

    element(by.id('password2')).sendKeys(protractor.Key.BACK_SPACE);
    await element(by.name("Register")).click();
    expect((await element.all(by.className("form-control is-invalid"))).length).toBe(1);
    
    element(by.id('email*')).sendKeys(<string> member.email);
    await element(by.name("Register")).click();
    expect((await element.all(by.className("form-control is-invalid"))).length).toBe(0);

    const EC = protractor.ExpectedConditions;
    await browser.wait(EC.urlIs(environment.baseUrl + "/login"));
    expect(await browser.getCurrentUrl()).toBe(environment.baseUrl + "/login");
    
  }

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
    
  });

  
});
