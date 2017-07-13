
module Oni = {
    type t;

    type runOptions = Js.t {. command: string, args: list string};

    type initializationOptions = Js.t {. clientName: string, rootPath: string };

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

let a x => x + 1;

let b x => a(x) * 2;

let c x => a(x) * 3;
