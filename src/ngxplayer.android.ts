import {
    apiKeyProperty, autoPlayProperty, NgxPlayerBase, PlayerErrorInfo, PlayerInfo,
    srcProperty,PlayerEventData
} from './ngxplayer.common';
import {isNullOrUndefined} from "tns-core-modules/utils/types";

declare const com;
export class NgxPlayer extends NgxPlayerBase {
    /**
     * InfoEvent
     * @type {string}
     */
    public static playerInfoEvent  = "playerInfo";
    /**
     * Youtube player instance
     */
    private player:any;
    /**
     * Youtube fragment
     */
    private fragment: any;
    /**
     * FullScreen
     */
    private fullScreen:boolean = false;
    /**
     * Player initialized
     */
    private initialized: boolean;
    /**
     * Enable disable debug mode
     * @type {boolean}
     * @private
     */
    private _debug = true;
    /**
     * Create native view
     * @returns {Object}
     */
    createNativeView(){
        console.log("NgXPlayer >> Running createNativeView");
        const frameLayout = new android.widget.FrameLayout(this._context);
        frameLayout.setId(android.view.View.generateViewId());
        // Set Layout
        frameLayout.setLayoutParams(
            new android.widget.FrameLayout.LayoutParams(
                android.widget.FrameLayout.LayoutParams.MATCH_PARENT,
                android.widget.FrameLayout.LayoutParams.MATCH_PARENT)
        );
        const fragmentManager = this._context.getFragmentManager();
        this.fragment = com.google.android.youtube.player.YouTubePlayerFragment.newInstance();
        fragmentManager.beginTransaction()
            .replace(frameLayout.getId(), this.fragment)
            .commit();
        return frameLayout;
    }
    /**
     * Dispose native view
     */
    disposeNativeView():void {
        try {
            if (this.player) {
                this.player.release();
                this.player = null;
                // Debug
                this.debug("DisposeNativeView >> Player released successfully");
            }
        } catch (e){
            // Debug
            this.debug("DisposeNativeView >> Fail releasing player");
        }
        try {
            if(this.fragment) {
                const fragmentManager = this._context.getFragmentManager();
                if (fragmentManager) {
                    fragmentManager.beginTransaction().remove(this.fragment).commit();
                    // Debug
                    this.debug("DisposeNativeView >> Fragment removed successfully");

                }
            }
        } catch (e){
            this.debug("DisposeNativeView >> Fail removing fragment");
        } finally {
            this.fragment = null;
        }
        this.debug("DisposeNativeView >> Destory completed");
    }

    /**
     * Print a debug message
     * @param message
     * @param options
     */
    private debug(message?:any, ...options){
        if(this._debug){
            console.log(message,options)
        }
    }
    /**
     * Initialize player
     */
    private initialize(){
        if(this.initialized) {
            // Debug
            this.debug("Initialize >> Player already initialized");
            return;
        }

        if (isNullOrUndefined(this.apiKey) || this.apiKey==''){
            this.dispatchEvent(PlayerInfo.INITIALIZATION_ERROR,PlayerErrorInfo.NO_API_KEY);
            // Debug
            this.debug("Initialize >> No API KEY detected raising error");
            return;
        }

        const that = new WeakRef(this);
        this.fragment.initialize(this.apiKey, new com.google.android.youtube.player.YouTubePlayer.OnInitializedListener({
            onInitializationFailure : function (provider, error) {
                // Event
                that.get().dispatchEvent(PlayerInfo.INITIALIZATION_ERROR,PlayerErrorInfo.YOUTUBE_API_INITIALIZATION_FAILURE);
                that.get().debug("Initialize : onInitializationFailure >> Initialization fail with error ["+error+"]");
            },
            onInitializationSuccess : function (provider, player, wasRestored) {
                that.get().debug("Initialize : onInitializationSuccess >> Initialization success");
                that.get().initialized = true;
                that.get().player = player;
                // Event
                that.get().dispatchEvent(PlayerInfo.INITIALIZATION_SUCCESS);
                const fullScreenCb = new com.google.android.youtube.player.YouTubePlayer.OnFullscreenListener(
                    {
                        onFullscreen(isFullscreen: boolean) {
                            that.get().fullScreen = isFullscreen;
                            // Event
                            that.get().dispatchEvent(PlayerInfo.FULLSCREEN,isFullscreen);
                        }
                    }
                );
                const playbackEventCb = new com.google.android.youtube.player.YouTubePlayer.PlaybackEventListener(
                    {
                        onBuffering(isBuffering: boolean) {that.get().dispatchEvent(PlayerInfo.BUFFERING,isBuffering)},
                        onPaused() { that.get().dispatchEvent(PlayerInfo.PAUSED);},
                        onPlaying() {that.get().dispatchEvent(PlayerInfo.PLAYING);},
                        onSeekTo(newPositionMillis: number) {that.get().dispatchEvent(PlayerInfo.SEEK,newPositionMillis);},
                        onStopped() {that.get().dispatchEvent(PlayerInfo.STOPPED);}
                    }
                );
                const playerStateChangeCb = new com.google.android.youtube.player.YouTubePlayer.PlayerStateChangeListener(
                    {
                        onAdStarted() {that.get().dispatchEvent(PlayerInfo.AD_STARTED);},
                        onError(reason) {that.get().dispatchEvent(PlayerInfo.ERROR,reason.toString());},
                        onLoaded(videoId: string) {that.get().dispatchEvent(PlayerInfo.LOADED,videoId);},
                        onLoading() {that.get().dispatchEvent(PlayerInfo.LOADING);},
                        onVideoEnded() {that.get().dispatchEvent(PlayerInfo.ENDED);},
                        onVideoStarted() {that.get().dispatchEvent(PlayerInfo.STARTED);}
                    }
                );
                that.get().player.setOnFullscreenListener(fullScreenCb);
                that.get().player.setPlaybackEventListener(playbackEventCb);
                that.get().player.setPlayerStateChangeListener(playerStateChangeCb);
                if (isNullOrUndefined(that.get().src) || that.get().src=='') {
                    that.get().debug("Initialize : onInitializationSuccess >> No default source set waiting ...");
                } else {
                    that.get().debug("Initialize : onInitializationSuccess >> Default source set ["+that.get().src+"]");
                    if(that.get().autoPlay==true){
                        player.loadVideo(that.get().src);
                        that.get().debug("Initialize : onInitializationSuccess >> AutoPlay enabled ["+that.get().autoPlay+"]");
                    } else {
                        player.cueVideo(that.get().src);
                        that.get().debug("Initialize : onInitializationSuccess >> AutoPlay enabled ["+that.get().autoPlay+"]");
                    }
                }
            }
        }));
    }
    /**
     * Dispatch event
     * @param event
     * @param data
     */
    private dispatchEvent(event,data?:any){
        this.notify(<PlayerEventData>{
            eventName: NgxPlayer.playerInfoEvent,
            object: this,
            event:event,
            data:data
        });
    }
    /**
     * Get fullScreen state
     * @returns {boolean}
     */
    public isFullScreen():boolean{
        return this.fullScreen;
    }
    /**
     * Set FullScreen mode
     * @param {boolean} fullScreen
     */
    public setFullScreen(fullScreen:boolean): void{
        if (this.player) {
            this.fullScreen = fullScreen;
            this.player.setFullscreen(this.fullScreen);
        }
    }
    /**
     * Get duration
     * @returns {number}
     */
    public getDuration():number {
        if(this.player)
            return this.player.getDurationMillis();
        return 0;
    }
    /**
     * Get duration
     * @returns {number}
     */
    public getCurrentTime():number {
        if(this.player)
            return this.player.getCurrentTimeMillis();
        return 0;
    }
    /**
     * AutoPlay Property
     * @param {boolean} autoPlay
     */
    [autoPlayProperty.setNative](autoPlay: boolean) {
        this.autoPlay = autoPlay;
    }
    /**
     * Src Property
     * @param {string} src
     */
    [srcProperty.setNative](src: string) {
        this.src = src;
        if(this.player){
            if(this.player.isPlaying()){
                this.player.pause();
            }
            this.player.loadVideo(this.src);
        }
    }
    /**
     * Api Key Property
     * @param {string} apiKey
     */
    [apiKeyProperty.setNative](apiKey: string) {
        this.apiKey = apiKey;
        this.initialize();
    }
}