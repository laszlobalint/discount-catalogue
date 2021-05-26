import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;
import java.util.HashMap;
import java.util.Map;
import static org.junit.Assert.assertFalse;

public class RegistrationDefaultSiteNonSelectedTest {
  private WebDriver driver;
  private JavascriptExecutor js;

  @Before
  public void setUp() {
    System.setProperty("webdriver.gecko.driver", "C:\\Users\\H89459592\\IdeaProjects\\discounttest\\src\\geckodriver.exe");
    driver = new FirefoxDriver();
    js = (JavascriptExecutor) driver;
    Map<String, Object> vars = new HashMap<String, Object>();
  }

  @After
  public void test_Cleaning(){
    System.out.println("Closing Browser");
    driver.close();
  }

  @Test
  public void registrationDefaultSiteNonSelected() {
    driver.get("http://localhost:4200/");
    driver.findElement(By.xpath("//a[contains(@href, \'/register\')]")).click();
    driver.findElement(By.xpath("//input[@formControlName=\'name\']")).sendKeys("John Doe 2");
    driver.findElement(By.xpath("//input[@type=\'email\']")).sendKeys("johndoe2@hobby.local");
    driver.findElement(By.xpath("(//input[@type=\'password\'])")).sendKeys("Almakarika03");
    driver.findElement(By.xpath("(//input[@type=\'password\'])[2]")).sendKeys("Almakarika03");
    {
      WebElement element = driver.findElement(By.xpath("//button[@type=\'submit\']"));
      boolean isEditable = element.isEnabled() && element.getAttribute("readonly") == null;
      assertFalse(isEditable);
    }
  }
}
