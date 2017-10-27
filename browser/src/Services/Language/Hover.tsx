/**
 * Definition.ts
 */

import { Observable } from "rxjs/Observable"

import "rxjs/add/operator/combineLatest"

import * as isEqual from "lodash/isEqual"

import * as types from "vscode-languageserver-types"

// import { editorManager } from "./../EditorManager"
// import { languageManager } from "./LanguageManager"

// import * as Helpers from "./../../Plugins/Api/LanguageClient/LanguageClientHelpers"

import { getQuickInfo } from "./QuickInfo"
import { getCodeActions } from "./CodeAction"

import * as UI from "./../../UI"
import * as Selectors from "./../../UI/Selectors"

import { renderQuickInfo } from "./../../UI/selectors/QuickInfoSelectors"

export const initHoverUI = (shouldHide$: Observable<void>, shouldUpdate$: Observable<void>) => {

    const hoverToolTipId = "hover-tool-tip"

    shouldHide$.subscribe(() => UI.Actions.hideToolTip(hoverToolTipId))

    const nullifier$ = shouldHide$.map(() => null)

    const quickInfoResults$ = shouldUpdate$
        .flatMap(async () => await getQuickInfo())
        .merge(nullifier$)

    const codeActionResults$ = shouldUpdate$
        .flatMap(async () => await getCodeActions())
        .merge(nullifier$)

    const errors$ = UI.state$
        .map((state) => Selectors.getErrorsForPosition(state))
        .distinctUntilChanged(isEqual)

    shouldUpdate$
            .combineLatest(quickInfoResults$, codeActionResults$, errors$)
            .debounceTime(100)
            .subscribe((args: [any, types.Hover, types.Command[], types.Diagnostic[]]) => {


                const [,hover,codeActions,errors] = args

                console.log("Updating hover-------")
                console.dir(hover)
                console.dir(codeActions)
                console.dir(errors)
                console.log("Updating hover-------")

                if (hover || (codeActions && codeActions.length) || (errors && errors.length)) {
                    const elem = renderQuickInfo(hover, errors)
                    UI.Actions.showToolTip(hoverToolTipId, elem, {
                        position: null,
                        openDirection: 1,
                        padding: "0px",
                    })
                }
            })
}
