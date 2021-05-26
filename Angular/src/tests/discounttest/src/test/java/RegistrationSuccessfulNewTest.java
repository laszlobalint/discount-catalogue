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

class RegistrationSuccessfulNewTest {
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
    public void registrationSuccess() {
        driver.get("http://localhost:4200/");
        driver.findElement(By.xpath("//a[contains(@href, \'/register\')]")).click();
        driver.findElement(By.xpath("//input[@formControlName=\'name\']")).sendKeys("TesztMartin");
        driver.findElement(By.xpath("//input[@type=\'email\']")).sendKeys("tesztmartin@hobby.local");
        driver.findElement(By.xpath("//input[@type=\'password\']")).sendKeys("Testcase01");
        driver.findElement(By.xpath("(//input[@type=\'password\'])[2]")).sendKeys("Testcase01");
        {
            WebElement dropdown = driver.findElement(By.xpath("//select[@formControlName=\'defaultSite\']"));
            dropdown.findElement(By.xpath("//option[. = 'Telephelytől független']")).click();
        }
        driver.findElement(By.xpath("//button[@type=\'submit\']")).click();
        driver.findElement(By.linkText("×")).click();
    }
}
