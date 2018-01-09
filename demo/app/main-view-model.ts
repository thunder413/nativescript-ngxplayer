import { Observable } from 'tns-core-modules/data/observable';
import {PlayerEventData} from "../../src/ngxplayer.common";

export class HelloWorldModel extends Observable {

    constructor() {
        super();

    }
    public onPlayerInfo(eventData: PlayerEventData) {
        console.log(eventData.event);
    }
}
