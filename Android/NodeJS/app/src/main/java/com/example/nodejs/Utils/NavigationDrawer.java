package com.example.nodejs.Utils;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.drawable.Drawable;
import android.preference.PreferenceManager;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.EditText;
import android.widget.Toast;

import com.example.nodejs.Activities.adminActivities.ListAllUsersActivity;
import com.example.nodejs.Activities.catalogueActivities.DiscountCatalogueActivity;
import com.example.nodejs.Activities.loginActivities.LoginActivity;
import com.example.nodejs.R;
import com.example.nodejs.HttpRequest.ITSHBackend;
import com.example.nodejs.HttpRequest.RetrofitClient;
import com.example.nodejs.Model.User;
import com.example.nodejs.Activities.userActivities.SetProfilePictureActivity;
import com.example.nodejs.Activities.userActivities.UpdateActivity;
import com.github.javiersantos.materialstyleddialogs.MaterialStyledDialog;
import com.mikepenz.materialdrawer.AccountHeader;
import com.mikepenz.materialdrawer.AccountHeaderBuilder;
import com.mikepenz.materialdrawer.Drawer;
import com.mikepenz.materialdrawer.DrawerBuilder;
import com.mikepenz.materialdrawer.model.DividerDrawerItem;
import com.mikepenz.materialdrawer.model.PrimaryDrawerItem;
import com.mikepenz.materialdrawer.model.ProfileDrawerItem;
import com.mikepenz.materialdrawer.model.SecondaryDrawerItem;

import java.io.File;

import io.reactivex.android.schedulers.AndroidSchedulers;
import io.reactivex.disposables.CompositeDisposable;
import io.reactivex.schedulers.Schedulers;
import retrofit2.Retrofit;

import static android.content.Context.MODE_PRIVATE;

public class NavigationDrawer {
    private Activity callingActivity;
    private Drawable profilePic;
    private User user;
    private Drawer drawer;
    private String token;

    public NavigationDrawer(Activity callingActivity, Drawable profilePic, User user, String token) {
        this.callingActivity = callingActivity;
        this.profilePic = profilePic;
        this.user = user;
        this.token = token;
    }

    private void startActivity(Class activityClass) {
        Intent myIntent = new Intent(callingActivity, activityClass);
        callingActivity.startActivityForResult(myIntent, 200);
    }

    private void removeUserData(){
        SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(callingActivity);
        File file = new File(callingActivity.getApplicationContext().getDir(callingActivity.getResources().getString(R.string.app_name), MODE_PRIVATE), "profile_pic.jpg");

        settings.edit().remove("token").apply();
        settings.edit().remove("user").apply();
        settings.edit().remove("filterResult").apply();
        settings.edit().remove("locale").apply();
        settings.edit().remove("prev_locale").apply();
        file.delete();
    }

    private void logout() {
        Intent myIntent = new Intent(callingActivity, LoginActivity.class);
        callingActivity.startActivity(myIntent);
        removeUserData();
        callingActivity.finish();
    }

    private void deleteUser(final String email, final String token){
        final View enter_password_view = LayoutInflater.from(callingActivity).inflate(R.layout.delete_user_layout, null);

        final String bearerToken = callingActivity.getString(R.string.bearer_token) + token;

        Retrofit retrofit = RetrofitClient.getInstance();
        ITSHBackend myAPI = retrofit.create(ITSHBackend.class);
        CompositeDisposable compositeDisposable = new CompositeDisposable();

        new MaterialStyledDialog.Builder(callingActivity)
                .setTitle(R.string.enter_password)
                .setDescription(R.string.one_more_step)
                .setCustomView(enter_password_view)
                .setNegativeText(R.string.cancel)
                .onNegative((dialog, which) -> dialog.dismiss())
                .setPositiveText(R.string.delete)
                .onPositive((dialog, which) -> {
                    EditText deletePwText = enter_password_view.findViewById(R.id.deletePwText);
                    compositeDisposable.add(myAPI.deleteUser(bearerToken, email, deletePwText.getText().toString())
                            .subscribeOn(Schedulers.io())
                            .observeOn(AndroidSchedulers.mainThread())
                            .subscribe(response -> {
                                if (response.code() >= 200 && response.code() < 300) {
                                    Toast.makeText(callingActivity, callingActivity.getString(R.string.deletion_successful), Toast.LENGTH_LONG).show();
                                    logout();
                                } else {
                                    Toast.makeText(callingActivity, response.code() + " " + response.errorBody().string(), Toast.LENGTH_LONG).show();
                                }
                            }));
                }).show();
    }

    public Drawer createNavigationDrawer() {
        String name = user.getName();
        if (user.getIs_admin() == 1){
            name = name + " (Admin)";
        }

        AccountHeader headerResult = new AccountHeaderBuilder()
                .withActivity(callingActivity)
                .addProfiles(
                        new ProfileDrawerItem().withName(name).withEmail(user.getEmail()).withIcon(profilePic)
                )
                .withOnAccountHeaderListener((view, profile, currentProfile) -> {
                    startActivity(SetProfilePictureActivity.class);
                    return false;
                })
                .build();

        drawer = new DrawerBuilder()
                .withActivity(callingActivity)
                .withAccountHeader(headerResult)
                .addDrawerItems(
                        new PrimaryDrawerItem().withIdentifier(1).withName(R.string.main_menu),
                        new DividerDrawerItem(),
                        new PrimaryDrawerItem().withIdentifier(2).withName(R.string.discount_catalogue)
                )
                .withOnDrawerItemClickListener((view, position, drawerItem) -> {
                    switch ((int) drawerItem.getIdentifier()){
                        case 1:
                            if (callingActivity.getLocalClassName().equals("HomeActivity")){
                                drawer.setSelection(-1);
                                break;
                            } else {
                                callingActivity.finish();
                                break;
                            }
                        case 2:
                            if (callingActivity.getLocalClassName().equals("DiscountCatalogueActivity")){
                                drawer.setSelection(-1);
                                break;
                            } else {
                                startActivity(DiscountCatalogueActivity.class);
                                drawer.closeDrawer();
                                break;
                            }

                        case 3:
                            startActivity(ListAllUsersActivity.class);
                            drawer.closeDrawer();
                            break;

                        case 4:
                            startActivity(UpdateActivity.class);
                            drawer.closeDrawer();
                            break;
                        case 5:
                            deleteUser(user.getEmail(), token);
                            break;

                        case 6:
                            logout();
                            break;
                    }

                    return true;
                })
                .withSelectedItem(-1)
                .build();

        if (user.getIs_admin() == 1){
            PrimaryDrawerItem listAllUsersDrawerItem = new PrimaryDrawerItem().withIdentifier(3).withName(callingActivity.getString(R.string.admin_list_users));
            drawer.addItem(listAllUsersDrawerItem);
        }

        SecondaryDrawerItem updateUserDrawerItem = new SecondaryDrawerItem().withIdentifier(4).withName(callingActivity.getString(R.string.update_info));
        drawer.addStickyFooterItem(updateUserDrawerItem);

        SecondaryDrawerItem deleteUserDrawerItem = new SecondaryDrawerItem().withIdentifier(5).withName(callingActivity.getString(R.string.delete_user));
        drawer.addStickyFooterItem(deleteUserDrawerItem);

        drawer.addStickyFooterItem(new DividerDrawerItem());

        SecondaryDrawerItem logoutDrawerItem = new SecondaryDrawerItem().withIdentifier(6).withName(callingActivity.getString(R.string.logout));
        drawer.addStickyFooterItem(logoutDrawerItem);

        return drawer;
    }
}
