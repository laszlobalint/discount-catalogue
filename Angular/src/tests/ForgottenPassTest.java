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

public class ForgottenPassTest {
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
  public void forgottenPass() {
    driver.get("http://localhost:4200/");
    driver.manage().window().setSize(new Dimension(1496, 1055));
    driver.findElement(By.linkText("Login")).click();
    driver.findElement(By.cssSelector(".ng-valid")).sendKeys("johndoe@hobby.local");
    driver.findElement(By.xpath("//input[@type=\'password\']")).sendKeys("Almakarika01");
    driver.findElement(By.cssSelector(".btn")).click();
    driver.findElement(By.xpath("//input[@type=\'email\']")).click();
    driver.findElement(By.cssSelector(".container:nth-child(3) > .form-control")).click();
    driver.findElement(By.cssSelector("button:nth-child(1)")).click();
    driver.findElement(By.linkText("Logout")).click();
    driver.findElement(By.cssSelector(".ng-valid")).sendKeys("johndoe@hobby.local");
    driver.findElement(By.xpath("//input[@type=\'password\']")).sendKeys("Almakarika01");
    driver.findElement(By.xpath("//form")).click();
    driver.findElement(By.xpath("//input[@type=\'email\']")).sendKeys("johndoe@hobby.local");
  }
}
