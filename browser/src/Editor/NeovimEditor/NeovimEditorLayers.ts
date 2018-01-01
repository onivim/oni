/**
 * NeovimEditorLayers.ts
 *
 * Implementation of editor 'layers'
 *
 * Layers are custom rendering strategies for buffers
 */

import * as Oni from "oni-api"
import { Event, IEvent } from "oni-types"

import { ILayer } from "./NeovimEditorStore"

// TODO: Enable fine-grained filtering for layers
// export type BufferFilterPredicate = (filter: Oni.Buffer) => boolean

export type LanguageFilter = string

// TODO: Expand BufferFilter to either be a language/filetype filter (string),
// or a filter predicate
export type BufferFilter = LanguageFilter

export type LayerFactory = (buffer: Oni.Buffer) => ILayer

export interface ILayerChangedEventArgs {
    buffer: Oni.Buffer
    layers: ILayer[]
}

export interface LayerFactoryInfo {
    filter: BufferFilter
    layerFactory: LayerFactory
}

export class NeovimEditorLayers {

    private _onLayerChangedEvent = new Event<ILayerChangedEventArgs>()

    private _layerFactories: LayerFactoryInfo[] = []

    public get onLayerChangedEvent(): IEvent<ILayerChangedEventArgs> {
        return this._onLayerChangedEvent
    }


    public add(filter: BufferFilter, layerFactory: LayerFactory): void {
        this._layerFactories.push({
            filter,
            layerFactory,
        })
    }

    public notifyBufferEntered(buffer: Oni.Buffer): void {

        const layerFactories = this._layerFactories.filter((val) => {
            return val.filter === buffer.language
        })

        const layers = layerFactories.map((lf) => {
            return lf.layerFactory(buffer)
        })

        this._onLayerChangedEvent.dispatch({
            buffer,
            layers,
        })
    }
}
