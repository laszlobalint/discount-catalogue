package com.example.nodejs.Activities.adminActivities;

import android.content.SharedPreferences;
import android.preference.PreferenceManager;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import com.example.nodejs.R;
import com.example.nodejs.HttpRequest.ITSHBackend;
import com.example.nodejs.HttpRequest.RetrofitClient;
import com.example.nodejs.Model.User;
import com.github.javiersantos.materialstyleddialogs.MaterialStyledDialog;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import io.reactivex.android.schedulers.AndroidSchedulers;
import io.reactivex.disposables.CompositeDisposable;
import io.reactivex.schedulers.Schedulers;
import retrofit2.Retrofit;

public class SelectedUserActivity extends AppCompatActivity {
    ITSHBackend myAPI;
    CompositeDisposable compositeDisposable = new CompositeDisposable();
    Gson gson = new GsonBuilder().setLenient().create();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_selected_user);

        Retrofit retrofit = RetrofitClient.getInstance();
        myAPI = retrofit.create(ITSHBackend.class);

        SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(SelectedUserActivity.this);
        final User selectedUser = gson.fromJson(settings.getString("selectedUser","{}"), User.class);
        final String token = settings.getString("token", "");

        TextView userIdTextView = findViewById(R.id.userIdTextView);
        CheckBox userAdminCheckBox = findViewById(R.id.userAdminCheckBox);
        EditText userNameEditText = findViewById(R.id.userNameEditText);
        EditText userEmailEditText = findViewById(R.id.userEmailEditText);
        Spinner adminUpdateSiteSpinner = findViewById(R.id.adminUpdateSiteSpinner);
        CheckBox userActiveCheckBox = findViewById(R.id.userActiveCheckBox);
        Button cancelSelectedUserActivity = findViewById(R.id.cancelSelectedUserActivity);
        Button adminUpdateButton = findViewById(R.id.adminUpdateButton);
        Button adminUserDeactivateButton = findViewById(R.id.adminUserDeleteButton);

        userIdTextView.setText(selectedUser.getId().toString());
        userNameEditText.setText(selectedUser.getName());
        userEmailEditText.setText(selectedUser.getEmail());

        if (selectedUser.getIs_admin() == 1){
            userAdminCheckBox.setChecked(true);
        }

        if (selectedUser.getIs_active() == 1) {
            userActiveCheckBox.setChecked(true);
        }

        switch (Integer.parseInt(selectedUser.getDefault_site_id())) {
            case 1:
                adminUpdateSiteSpinner.setSelection(0);
                break;
            case 2:
                adminUpdateSiteSpinner.setSelection(1);
                break;
            case 3:
                adminUpdateSiteSpinner.setSelection(2);
                break;
            case 4:
                adminUpdateSiteSpinner.setSelection(3);
                break;
        }

        adminUpdateButton.setOnClickListener(v ->
                adminUpdateData(selectedUser, userNameEditText.getText().toString(), userEmailEditText.getText().toString(), token));

        adminUserDeactivateButton.setOnClickListener(v -> adminDeactivateUser(selectedUser, token));

        cancelSelectedUserActivity.setOnClickListener(v -> finish());
    }

    public void adminUpdateData(final User user, final String name, final String email, String token){
        final String bearerToken = getString(R.string.bearer_token) + token;
        final Spinner adminUpdateSiteSpinner = findViewById(R.id.adminUpdateSiteSpinner);
        final String defaultSite = adminUpdateSiteSpinner.getSelectedItem().toString();
        final View enter_password_view = LayoutInflater.from(SelectedUserActivity.this).inflate(R.layout.delete_user_layout, null);

        new MaterialStyledDialog.Builder(SelectedUserActivity.this)
                .setTitle(R.string.enter_password)
                .setDescription(R.string.one_more_step)
                .setCustomView(enter_password_view)
                .setNegativeText(R.string.cancel)
                .onNegative((dialog, which) -> dialog.dismiss())
                .setPositiveText(R.string.update)
                .onPositive((dialog, which) -> {
                    EditText adminPwText = enter_password_view.findViewById(R.id.deletePwText);
                    compositeDisposable.add(myAPI.adminUpdateUser(bearerToken, user.getId(), name, email, adminPwText.getText().toString(), defaultSite)
                            .subscribeOn(Schedulers.io())
                            .observeOn(AndroidSchedulers.mainThread())
                            .subscribe(response -> {
                                if (response.code() >= 200 && response.code() < 300) {
                                    Toast.makeText(SelectedUserActivity.this, getString(R.string.password_again_cannot_empty), Toast.LENGTH_LONG).show();
                                    user.setName(name);
                                    user.setEmail(email);
                                    finish();
                                } else {
                                    Toast.makeText(SelectedUserActivity.this, response.code() + " " + response.errorBody().string(), Toast.LENGTH_LONG).show();
                                }
                            }));
                }).show();
    }

    public void adminDeactivateUser(User user, String token) {
        String bearerToken = getString(R.string.bearer_token) + token;

        compositeDisposable.add(myAPI.adminDeleteUser(bearerToken, user.getId())
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(response -> {
                    if(response.code() >= 200 && response.code() < 300) {
                        Toast.makeText(SelectedUserActivity.this, response.body().string() , Toast.LENGTH_LONG).show();
                        finish();
                    } else {
                        Toast.makeText(SelectedUserActivity.this,  response.code() + " " + response.errorBody().string(), Toast.LENGTH_LONG).show();
                    }
                }));
    }
}
