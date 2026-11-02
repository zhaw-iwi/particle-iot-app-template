#include "Particle.h"

SYSTEM_MODE(AUTOMATIC);
SYSTEM_THREAD(ENABLED);

// Contract shared with the default server configuration.
int counter = 0;
unsigned long lastIncrement = 0;
unsigned long lastPublish = 0;
bool publishRequested = false;

int setCounter(String argument) {
    // The public example only permits a reset, not arbitrary counter values.
    if (argument != "0") return -1;
    counter = 0;
    publishRequested = true;
    return 0;
}

void setup() {
    Particle.variable("counter", counter);
    Particle.function("setCounter", setCounter);
}

void loop() {
    const unsigned long now = millis();
    // Unsigned subtraction remains correct when millis() wraps around.
    if (now - lastIncrement >= 5000) {
        lastIncrement = now;
        counter = counter >= 1000000 ? 0 : counter + 1;
        publishRequested = true;
    }
    // Coalesce requests and avoid a publish burst when visitors press reset.
    if (publishRequested && Particle.connected() && now - lastPublish >= 1000) {
        lastPublish = now;
        if (Particle.publish("CounterEvent", String(counter), PRIVATE)) {
            publishRequested = false;
        }
    }
}
