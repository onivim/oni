module Oni = {
    type t;

    module LanguageClient = {
        type t;
    };

    module Configuration = {
        type t;

        external getValue: t => string => string => string = "" [@@bs.send];
    };

    external createLanguageClient: t => LanguageClient.t = "" [@@bs.send];

    external configuration: t => Configuration.t = "" [@@bs.get];

};

let activate oni: string => {
    let config = Oni.configuration oni;
    let command = Oni.Configuration.getValue config "ocaml.langServerCommand" "ocaml-language-server";
    command;
};
