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

public class RegistrationSuccessTest {
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
  public void registrationSuccess() {
    driver.get("http://localhost:4200/");
    driver.findElement(By.xpath("//a[contains(@href, \'/register\')]")).click();
    driver.findElement(By.xpath("//input[@formcontrolname=\'name\']")).sendKeys("TesztMartin");
    driver.findElement(By.xpath("//input[@type=\'email\']")).sendKeys("tesztmartin@hobby.local");
    driver.findElement(By.xpath("//input[@type=\'password\']")).sendKeys("Testcase01");
    driver.findElement(By.xpath("(//input[@type=\'password\'])[2]")).sendKeys("Testcase01");
    {
      WebElement dropdown = driver.findElement(By.xpath("//select[@formcontrolname=\'defaultSite\']"));
      dropdown.findElement(By.xpath("//option[. = 'Telephelytől független']")).click();
    }
    driver.findElement(By.xpath("//button[@type=\'submit\']")).click();
    driver.findElement(By.linkText("×")).click();
    driver.close();
  }
}
