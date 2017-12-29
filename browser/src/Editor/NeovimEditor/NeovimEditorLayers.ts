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

export type BufferFilterPredicate = (filter: Oni.Buffer) => boolean
export type BufferFilter = string | BufferFilterPredicate

export type LayerFactory = (buffer: Oni.Buffer) => ILayer

export interface ILayerChangedEventArgs {
    buffer: Buffer
    layers: ILayer[]
}

export class NeovimEditorLayers {

    private _onLayerChangedEvent = new Event<ILayerChangedEventArgs>()

    private _layerFactories: LayerFactory[] = []

    public get onLayerChangedEvent(): IEvent<ILayerChangedEventArgs {
        return this._onLayerChangedEvent
    }


    public add(/* TODO: bufferFilter: BufferFilter,*/ layerFactory: LayerFactory): void {
        this._layerFactories.push(layerFactory)
    }

    public notifyBufferEntered(buffer: Oni.Buffer): void {
        const layers = this._layerFactories.map((lf) => {
            return lf(buffer)
        })

        this._onLayerChangedEvent.dispatch({
            buffer,
            layers,
        })
    }
}
