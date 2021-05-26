package com.example.nodejs.Activities.userActivities;

import android.content.Intent;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import com.example.nodejs.Activities.loginActivities.LoginActivity;
import com.example.nodejs.R;
import com.example.nodejs.HttpRequest.ITSHBackend;
import com.example.nodejs.HttpRequest.RetrofitClient;

import io.reactivex.android.schedulers.AndroidSchedulers;
import io.reactivex.disposables.CompositeDisposable;
import io.reactivex.schedulers.Schedulers;
import retrofit2.Retrofit;

public class ResetPasswordActivity extends AppCompatActivity {
    ITSHBackend myAPI;
    Retrofit retrofit = RetrofitClient.getInstance();
    CompositeDisposable compositeDisposable = new CompositeDisposable();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        myAPI = retrofit.create(ITSHBackend.class);
        String resetToken = this.getIntent().getData().getLastPathSegment();

        compositeDisposable.add(myAPI.checkTokenAvailability(resetToken)
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(response -> {
                    if (response.code() >= 200 && response.code() < 300) {
                        setContentView(R.layout.activity_reset_password);
                        EditText newPasswordEditText = findViewById(R.id.newPasswordEditText);
                        EditText newPasswordAgainEditText = findViewById(R.id.newPasswordAgainEditText);
                        Button resetPasswordButton = findViewById(R.id.resetPasswordButton);
                        resetPasswordButton.setOnClickListener(v -> {
                            if (newPasswordEditText.getText().toString().equals("")) {
                                Toast.makeText(ResetPasswordActivity.this, getString(R.string.new_password_cannot_empty), Toast.LENGTH_SHORT).show();
                            } else if (newPasswordAgainEditText.getText().toString().equals("")){
                                Toast.makeText(ResetPasswordActivity.this, getString(R.string.password_again_cannot_empty), Toast.LENGTH_SHORT).show();
                            } else if (newPasswordEditText.getText().toString().equals(newPasswordAgainEditText.getText().toString())){
                                setNewPassword(resetToken, newPasswordEditText.getText().toString());
                            } else {
                                Toast.makeText(ResetPasswordActivity.this, getString(R.string.passwords_not_match), Toast.LENGTH_SHORT).show();
                            }
                        });
                    } else {
                        Toast.makeText(ResetPasswordActivity.this, getString(R.string.reset_token_invalid_expired), Toast.LENGTH_LONG).show();
                        startMainActivity();
                    }
                }));
    }

    public void setNewPassword(String resetToken, String newPassword){
        compositeDisposable.add(myAPI.setNewPassword(resetToken, newPassword)
            .subscribeOn(Schedulers.io())
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe(response -> {
                if (response.code() >= 200 && response.code() < 300) {
                    Toast.makeText(ResetPasswordActivity.this, getString(R.string.new_password_set), Toast.LENGTH_SHORT).show();
                    startMainActivity();
                } else {
                    Toast.makeText(ResetPasswordActivity.this, response.code() + " " + response.errorBody().string(), Toast.LENGTH_SHORT).show();
                }
            }));
    }

    public void startMainActivity(){
        Intent myIntent = new Intent(ResetPasswordActivity.this, LoginActivity.class);
        ResetPasswordActivity.this.startActivity(myIntent);
        finish();
    }
}
