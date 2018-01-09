var Ngxplayer = require("nativescript-ngxplayer").Ngxplayer;
var ngxplayer = new Ngxplayer();

describe("greet function", function() {
    it("exists", function() {
        expect(ngxplayer.greet).toBeDefined();
    });

    it("returns a string", function() {
        expect(ngxplayer.greet()).toEqual("Hello, NS");
    });
});