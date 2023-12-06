import { Fsm } from "machina" ;

const MAX_FLOORS = 5;

class Elevator extends Fsm {
    currentFloor: number;
    targetFloor: number | null;

    constructor() {
        super({
            initialState: "idle",
            states: {
                idle: {
                    requestFloor: (floor: number) => {
                        if (floor < 1 || floor > MAX_FLOORS) {
                            console.log("Invalid floor requested.");
                        } else if (floor === this.currentFloor) {
                            console.log("You are already on floor " + floor + ".");
                        } else {
                            this.transition("moving");
                            this.targetFloor = floor;
                            this.emit("moving", { direction: this.calculateDirection() });
                        }
                    }
                },
                moving: {
                    _onEnter: () => {
                        console.log("Elevator is now moving.");
                    },
                    arrived: () => {
                        console.log("Elevator has arrived at floor " + this.targetFloor + ".");
                        this.currentFloor = this.targetFloor as number;
                        this.emit("arrived", { floor: this.currentFloor });
                        this.transition("doorOpen");
                    }
                },
                doorOpen: {
                    _onEnter: () => {
                        console.log("Elevator door is open.");
                        this.emit("doorOpen");
                    },
                    doorClose: () => {
                        console.log("Elevator door is closing.");
                        this.transition("idle");
                    },
                    timeout: () => {
                        console.log("Door timeout. Closing door.");
                        this.handle("doorClose");
                    }
                }
            }
        });

        this.currentFloor = 1;
        this.targetFloor = null;
    }

    calculateDirection(): string {
        if (this.targetFloor === this.currentFloor) {
            return "stay";
        }
        return this.targetFloor! > this.currentFloor ? "up" : "down";
    }

    requestFloor(floor: number): void {
        this.handle("requestFloor", floor);
    }

    doorTimeout(): void {
        this.handle("timeout");
    }

    doorClose(): void {
        this.handle("doorClose");
    }
}

// Example usage:
const elevator = new Elevator();
console.log("Current state:", elevator.state); // Output: "idle"
elevator.requestFloor(3);
// Output: "Elevator is now moving."
// Output: "Elevator has arrived at floor 3."
// Output: "Elevator door is open."
elevator.doorTimeout();
// Output: "Door timeout. Closing door."
// Output: "Elevator door is closing."