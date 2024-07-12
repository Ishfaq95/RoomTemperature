package com.roomtemperaturethermometer;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class TemperatureModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;
    private final SensorManager sensorManager;
    private final Sensor temperatureSensor;
    private float currentTemperature = Float.NaN;

    TemperatureModule(ReactApplicationContext context) {
        super(context);
        this.reactContext = context;
        this.sensorManager = (SensorManager) context.getSystemService(Context.SENSOR_SERVICE);
        this.temperatureSensor = sensorManager.getDefaultSensor(Sensor.TYPE_AMBIENT_TEMPERATURE);

        if (temperatureSensor != null) {
            sensorManager.registerListener(new SensorEventListener() {
                @Override
                public void onSensorChanged(SensorEvent event) {
                    currentTemperature = event.values[0];
                }

                @Override
                public void onAccuracyChanged(Sensor sensor, int accuracy) {
                    // No implementation needed
                }
            }, temperatureSensor, SensorManager.SENSOR_DELAY_NORMAL);
        }
    }

    @Override
    public String getName() {
        return "TemperatureModule";
    }

    @ReactMethod
    public void getTemperature(Promise promise) {
        if (!Float.isNaN(currentTemperature)) {
            promise.resolve(currentTemperature);
        } else {
            promise.reject("NO_SENSOR", "Temperature sensor not available or not ready");
        }
    }
}
