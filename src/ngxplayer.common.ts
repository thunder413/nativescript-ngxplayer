import {View} from "tns-core-modules/ui/core/view";
import {Property} from "tns-core-modules/ui/core/properties";
import {EventData} from "tns-core-modules/data/observable";


/**
 * PlayerInfo
 */
export class PlayerInfo {
    public static INITIALIZATION_SUCCESS:string="initialization_success";
    public static INITIALIZATION_ERROR: "initalization_error";
    public static LOADING: "loading_event";
    public static BUFFERING: "buffering";
    public static LOADED: "loaded_event";
    public static STARTED: "started_event";
    public static PLAYING: "playing_event";
    public static PAUSED: "paused_event";
    public static SEEK: "seek_event";
    public static AD_STARTED: "ad_started_event";
    public static ENDED: "ended_event";
    public static STOPPED: "stopped_event";
    public static FULLSCREEN: "fullScreen";
    public static ERROR: "error_event";
}
export declare interface  PlayerEventData extends EventData {
    event: string;
    data:any;
}
/**
 *
 */
export class PlayerErrorInfo {
    public static NO_API_KEY = "Trying to initialize player when not API key is set";
    public static YOUTUBE_API_INITIALIZATION_FAILURE = "Youtube Api fail with an internal error";
    public static YOUTUBE_API_ERROR = "Youtube Api player raise an error";
}

export const apiKeyProperty = new Property<NgxPlayerBase, string>({
    name: 'apiKey',
    defaultValue: ''
});
export const srcProperty = new Property<NgxPlayerBase, string>({
    name: 'src',
    defaultValue: ''
});
export const autoPlayProperty = new Property<NgxPlayerBase, boolean>({
    name: 'autoPlay',
    defaultValue: true
});
export class NgxPlayerBase extends View {
    apiKey: string;
    src: string;
    autoPlay: boolean;
}
srcProperty.register(NgxPlayerBase);
apiKeyProperty.register(NgxPlayerBase);
autoPlayProperty.register(NgxPlayerBase);