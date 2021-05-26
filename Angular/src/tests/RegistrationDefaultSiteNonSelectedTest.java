import org.junit.Test;
import org.junit.Before;
import org.junit.After;
import static org.junit.Assert.*;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.core.IsNot.not;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Alert;
import org.openqa.selenium.Keys;
import java.util.*;
import java.net.MalformedURLException;
import java.net.URL;

public class RegistrationDefaultSiteNonSelectedTest {
  private WebDriver driver;
  private Map<String, Object> vars;
  JavascriptExecutor js;
  @Before
  public void setUp() {
    driver = new ChromeDriver();
    js = (JavascriptExecutor) driver;
    vars = new HashMap<String, Object>();
  }
  @After
  public void tearDown() {
    driver.quit();
  }
  @Test
  public void registrationDefaultSiteNonSelected() {
    driver.get("http://localhost:4200/");
    driver.findElement(By.xpath("//a[contains(@href, \'/register\')]")).click();
    driver.findElement(By.xpath("//input[@formcontrolname=\'name\']")).sendKeys("John Doe 2");
    driver.findElement(By.xpath("//input[@type=\'email\']")).sendKeys("johndoe2@hobby.local");
    driver.findElement(By.xpath("(//input[@type=\'password\'])")).sendKeys("Almakarika03");
    driver.findElement(By.xpath("(//input[@type=\'password\'])[2]")).sendKeys("Almakarika03");
    {
      WebElement element = driver.findElement(By.xpath("//button[@type=\'submit\']"));
      Boolean isEditable = element.isEnabled() && element.getAttribute("readonly") == null;
      assertFalse(isEditable);
    }
    driver.close();
  }
}
