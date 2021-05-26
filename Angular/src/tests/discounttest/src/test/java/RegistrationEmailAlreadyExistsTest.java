import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import java.util.HashMap;
import java.util.Map;

public class RegistrationEmailAlreadyExistsTest {
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
    public void test_Cleaning() {
        System.out.println("Closing Browser");
        driver.close();
    }

    @Test
    public void registrationEmailAlreadyExist() throws InterruptedException {
        driver.get("http://localhost:4200/");
        driver.findElement(By.xpath("//a[contains(@href, \'/register\')]")).click();
        driver.findElement(By.xpath("//input[@formControlName=\'name\']")).sendKeys("John Doe");
        driver.findElement(By.xpath("//input[@type=\'email\']")).sendKeys("johndoe@hobby.local");
        driver.findElement(By.xpath("(//input[@type=\'password\'])")).sendKeys("Almakarika03");
        driver.findElement(By.xpath("(//input[@type=\'password\'])[2]")).sendKeys("Almakarika03");
        {
            Select dropList = new Select(driver.findElement(By.id("defaultSite")));
            dropList.selectByVisibleText("Szeged");
        }
        driver.findElement(By.xpath("//button[@type=\'submit\']")).click();
        {
            WebDriverWait wait = new WebDriverWait(driver, 5);
            wait.until(ExpectedConditions.presenceOfElementLocated(By.xpath("//div[@id=\'alert-message\']")));
        }
    }
}
