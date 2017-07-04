
module Oni = {
    type t;

    type runOptions = 
        { command: string, args: list string};

    type initializationOptions = 
        { clientName: string, rootPath: string };

    type initializationPromise = Js.Promise.t initializationOptions;
    type initializationFunction = string => initializationPromise;

    module LanguageClient = {
        type t;
    };

    module Configuration = {
        type t;

        external getValue: t => string => string => string = "" [@@bs.send];
    };

    external createLanguageClient: t => runOptions => initializationFunction => LanguageClient.t = "" [@@bs.send];

    external configuration: t => Configuration.t = "" [@@bs.get];

};

let activate oni: Oni.LanguageClient.t => {
    let config = Oni.configuration oni;
    let startCommand = Oni.Configuration.getValue config "ocaml.langServerCommand" "ocaml-language-server";

    open Oni;

    let startOptions: runOptions = {
        command: startCommand,
        args: ["a", "b"]
    };

    let getInitializationOptions filePath => {
        let opts: initializationOptions = {
            clientName: "ocaml",
            rootPath: filePath
        };
        Js.Promise.resolve opts;
    };

    let client = Oni.createLanguageClient oni startOptions getInitializationOptions;
    client;
};
