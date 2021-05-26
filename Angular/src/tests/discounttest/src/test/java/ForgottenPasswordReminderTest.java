import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import java.util.HashMap;
import java.util.Map;

public class ForgottenPasswordReminderTest {
  private WebDriver driver;
  private Map<String, Object> vars;
  private JavascriptExecutor js;

  @Before
  public void setUp() {
    System.setProperty("webdriver.gecko.driver", "C:\\Users\\H89459592\\IdeaProjects\\discounttest\\src\\geckodriver.exe");
    driver = new FirefoxDriver();
    js = (JavascriptExecutor) driver;
    vars = new HashMap<String, Object>();
  }

  @After
  public void test_Cleaning(){
    System.out.println("Closing Browser");
    driver.close();
  }

  @Test
  public void forgottenPass() throws InterruptedException {
    driver.get("http://localhost:4200/");
    driver.findElement(By.linkText("Login")).click();
    driver.findElement(By.xpath("//input[@type=\'email\']")).click();
    driver.findElement(By.xpath("//input[@type=\'email\']")).sendKeys("johndoe@hobby.local");
    driver.findElement(By.id("forgotPassword")).isEnabled();
    driver.findElement(By.id("forgotPassword")).click();
    Thread.sleep(1000);
    driver.findElement(By.cssSelector(".alert-success"));
  }
}
