import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.support.ui.Select;
import java.util.HashMap;
import java.util.Map;
import static org.junit.Assert.assertFalse;

public class RegistrationPasswordNotMatchTest {
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
  public void registrationPasswordNotMatch() {
    driver.get("http://localhost:4200/");
    driver.findElement(By.xpath("//a[contains(@href, \'/register\')]")).click();
    driver.findElement(By.xpath("//input[@formControlName=\'name\']")).sendKeys("John Doe 2");
    driver.findElement(By.xpath("//input[@type=\'email\']")).sendKeys("johndoe2@hobby.local");
    driver.findElement(By.xpath("(//input[@type=\'password\'])")).sendKeys("Almakarika03");
    driver.findElement(By.xpath("(//input[@type=\'password\'])[2]")).sendKeys("Almakarika04");
    {
      Select dropList = new Select(driver.findElement(By.id("defaultSite")));
      dropList.selectByVisibleText("Szeged");
    }
    {
      WebElement element = driver.findElement(By.xpath("//button[@type=\'submit\']"));
      boolean isEditable = element.isEnabled() && element.getAttribute("readonly") == null;
      assertFalse(isEditable);
    }
  }
}
