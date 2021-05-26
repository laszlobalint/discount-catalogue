package com.example.nodejs.Model;

import android.app.Activity;
import android.content.SharedPreferences;
import android.os.Parcel;
import android.os.Parcelable;
import android.preference.PreferenceManager;

import java.util.Date;

public class User implements Parcelable {

    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeInt(id);
        dest.writeString(unique_id);
        dest.writeString(name);
        dest.writeString(email);
        dest.writeString(encrypted_password);
        dest.writeString(salt);
        dest.writeLong(created_at.getTime());
        dest.writeLong(updated_at.getTime());
        dest.writeInt(is_active);
        dest.writeInt(is_deleted);
        dest.writeInt(is_admin);
        dest.writeString(default_site_id);
    }

    public User() {}

    private User(Parcel in) {
        id = in.readInt();
        unique_id = in.readString();
        name = in.readString();
        email = in.readString();
        encrypted_password = in.readString();
        salt = in.readString();
        created_at = new Date(in.readLong());
        updated_at = new Date(in.readLong());
        is_active = in.readInt();
        is_deleted = in.readInt();
        is_admin = in.readInt();
        default_site_id = in.readString();
    }

    public static final Parcelable.Creator<User> CREATOR = new Parcelable.Creator<User>() {
        public User createFromParcel(Parcel in) {
            return new User(in);
        }

        public User[] newArray(int size) {
            return new User[size];
        }
    };

    public void printAttributesToConsole(){
        System.out.println("ID: " + id);
        System.out.println("Name: " + name);
        System.out.println("Email: " + email);
        System.out.println("Registered at: " + created_at);
        System.out.println("Updated at: " + updated_at);
        System.out.println("Is active: " + is_active);
        System.out.println("Is deleted: " + is_deleted);
        System.out.println("Is admin: " + is_admin);
        System.out.println("Default site ID: " + default_site_id);
    }

    public static void storeTokenIfChanged(Activity callingActivity, String storedToken, String newToken){
        SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(callingActivity);
        if (!storedToken.equals(newToken)){
            String splitToken = newToken.split(" ")[1];
            settings.edit().putString("token", splitToken).apply();
        }
    }

    private Integer id;
    private String unique_id;
    private String name;
    private String email;
    private String encrypted_password;
    private String salt;
    private Date created_at;
    private Date updated_at;
    private int is_active;
    private int is_deleted;
    private int is_admin;
    private String default_site_id;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getUnique_id() {
        return unique_id;
    }

    public void setUnique_id(String unique_id) {
        this.unique_id = unique_id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getEncrypted_password() {
        return encrypted_password;
    }

    public void setEncrypted_password(String encrypted_password) {
        this.encrypted_password = encrypted_password;
    }

    public String getSalt() {
        return salt;
    }

    public void setSalt(String salt) {
        this.salt = salt;
    }

    public Date getCreated_at() {
        return created_at;
    }

    public void setCreated_at(Date created_at) {
        this.created_at = created_at;
    }

    public Date getUpdated_at() {
        return updated_at;
    }

    public void setUpdated_at(Date updated_at) {
        this.updated_at = updated_at;
    }

    public int getIs_active() {
        return is_active;
    }

    public void setIs_active(int is_active) {
        this.is_active = is_active;
    }

    public int getIs_deleted() {
        return is_deleted;
    }

    public void setIs_deleted(int is_deleted) {
        this.is_deleted = is_deleted;
    }

    public int getIs_admin() {
        return is_admin;
    }

    public void setIs_admin(int is_admin) {
        this.is_admin = is_admin;
    }

    public String getDefault_site_id() {
        return default_site_id;
    }

    public void setDefault_site_id(String default_site) {
        this.default_site_id = default_site;
    }
}
