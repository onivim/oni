
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
