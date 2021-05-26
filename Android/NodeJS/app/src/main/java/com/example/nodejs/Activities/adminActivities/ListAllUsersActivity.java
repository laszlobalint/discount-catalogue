package com.example.nodejs.Activities.adminActivities;

import android.content.Intent;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

import com.example.nodejs.Activities.homeActivities.HomeActivity;
import com.example.nodejs.R;
import com.example.nodejs.HttpRequest.ITSHBackend;
import com.example.nodejs.HttpRequest.RetrofitClient;
import com.example.nodejs.Model.User;
import com.example.nodejs.Utils.UsersRecycleViewAdapter;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;

import io.reactivex.android.schedulers.AndroidSchedulers;
import io.reactivex.disposables.CompositeDisposable;
import io.reactivex.schedulers.Schedulers;
import retrofit2.Retrofit;

public class ListAllUsersActivity extends AppCompatActivity implements UsersRecycleViewAdapter.ItemClickListener {
    ITSHBackend myAPI;
    Retrofit retrofit = RetrofitClient.getInstance();
    CompositeDisposable compositeDisposable = new CompositeDisposable();
    Gson gson = new GsonBuilder().setLenient().create();
    UsersRecycleViewAdapter usersRecycleViewAdapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_list_all_users);
        final SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(ListAllUsersActivity.this);
        myAPI = retrofit.create(ITSHBackend.class);
        String bearerToken = getString(R.string.bearer_token) + settings.getString("token","");

        RecyclerView recyclerView = findViewById(R.id.adminListUsersRecycleView);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        recyclerView.setItemViewCacheSize(20);
        recyclerView.setDrawingCacheEnabled(true);
        recyclerView.setDrawingCacheQuality(View.DRAWING_CACHE_QUALITY_HIGH);

        Button updateUserListButton = findViewById(R.id.updateUserListButton);
        Button cancelUserListButton = findViewById(R.id.cancelUserListButton);

        cancelUserListButton.setOnClickListener(v -> cancelUserList());

        updateUserListButton.setOnClickListener(v -> compositeDisposable.add(myAPI.adminListAllUsers(bearerToken)
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(response -> {
                    if (response.code() >= 200 && response.code() < 300) {
                        JsonArray allUsersJsonArray = response.body().getAsJsonArray("users");
                        settings.edit().putString("users", gson.toJson(allUsersJsonArray)).apply();
                        addUserJsonArrayToRecyclerView(recyclerView, allUsersJsonArray);
                        User.storeTokenIfChanged(this, bearerToken, response.headers().get("Authorization"));
                        Toast.makeText(ListAllUsersActivity.this, "User list retrieve successful.", Toast.LENGTH_LONG).show();
                    } else {
                        Toast.makeText(ListAllUsersActivity.this, response.code() + " " + response.errorBody().string(), Toast.LENGTH_LONG).show();
                    }
                })));
    }

    @Override
    protected void onResume() {
        super.onResume();

        final SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(ListAllUsersActivity.this);
        RecyclerView recyclerView = findViewById(R.id.adminListUsersRecycleView);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        recyclerView.setItemViewCacheSize(20);
        recyclerView.setDrawingCacheEnabled(true);
        recyclerView.setDrawingCacheQuality(View.DRAWING_CACHE_QUALITY_HIGH);

        myAPI = retrofit.create(ITSHBackend.class);
        String bearerToken = getString(R.string.bearer_token) + settings.getString("token","");
        compositeDisposable.add(myAPI.adminListAllUsers(bearerToken)
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(response -> {
                    if (response.code() >= 200 && response.code() < 300) {
                        JsonArray allUsersJsonArray = response.body().getAsJsonArray("users");
                        settings.edit().putString("users", gson.toJson(allUsersJsonArray)).apply();
                        addUserJsonArrayToRecyclerView(recyclerView, allUsersJsonArray);
                        User.storeTokenIfChanged(this, bearerToken, response.headers().get("Authorization"));
                        Toast.makeText(ListAllUsersActivity.this, "User list retrieve successful.", Toast.LENGTH_LONG).show();
                    } else {
                        Toast.makeText(ListAllUsersActivity.this, response.code() + " " + response.errorBody().string(), Toast.LENGTH_LONG).show();
                    }
                }));
    }

    @Override
    public void onItemClick(View view, int position) {
        SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(ListAllUsersActivity.this);
        User selectedUser = usersRecycleViewAdapter.getItem(position);
        settings.edit().putString("selectedUser", gson.toJson(selectedUser)).apply();
        startSelectedUserActivity();
    }

    private void startSelectedUserActivity(){
        Intent myIntent = new Intent(ListAllUsersActivity.this, SelectedUserActivity.class);
        this.startActivity(myIntent);
    }

    public void addUserJsonArrayToRecyclerView(RecyclerView recyclerView, JsonArray usersJsonArray) {
        usersRecycleViewAdapter = new UsersRecycleViewAdapter(ListAllUsersActivity.this, usersJsonArray);
        usersRecycleViewAdapter.setClickListener(ListAllUsersActivity.this);
        recyclerView.setAdapter(usersRecycleViewAdapter);
    }

    private void cancelUserList() {
        Intent myIntent = new Intent(ListAllUsersActivity.this, HomeActivity.class);
        ListAllUsersActivity.this.startActivity(myIntent);
        finish();
    }
}
