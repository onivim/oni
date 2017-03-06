/**
 * Events.ts
 *
 * Description of events that are emitted by the UI layer
 */

import { EventEmitter } from "events"

export const events = new EventEmitter()

export const CompletionItemSelectedEvent = "completion-item-selected"
export const MenuItemSelectedEvent = "menu-item-selected"
