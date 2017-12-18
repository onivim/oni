import test from "ava"

import { createMetaKeyResolver, ignoreMetaKeyResolver, remapResolver } from "../src/Input/Keyboard/Resolvers"

test("ignoreMetaResolver ignores key in blacklist", t => {
    const result = ignoreMetaKeyResolver(keyShift, "Shift")
    t.is(result, null)
})

test("ignoreMetaResolver passes through key not in blacklist", t => {
    const result = ignoreMetaKeyResolver(keyS, "s")
    t.is(result, "s")
})

test("remapResolver remaps key in list", t => {
    const result = remapResolver(keyBackSpace, "Backspace")
    t.is(result, "bs")
})

test("metaResolver in english mode handles english <c-s-p>", t => {
    const metaResolver = createMetaKeyResolver(englishLayout)
    const key = control(shift(keyP))
    const result = metaResolver(key, keyP.key)
    t.is(result, "<s-c-p>")
})

test("metaResolver in english-intl mode handles §", t => {
    const metaResolver = createMetaKeyResolver(englishInternationalLayout)
    const key = control(alt(shift(createKeyEvent("§", "KeyS"))))
    const result = metaResolver(key, key.key)
    t.is(result, "§")
})

test("metaResolver in german mode handles ö", t => {
    const metaResolver = createMetaKeyResolver(germanLayout)
    const key = keyUmlautedO
    const result = metaResolver(key, key.key)
    t.is(result, "ö")
})

test("metaResolver in german mode handles Ö", t => {
    const metaResolver = createMetaKeyResolver(germanLayout)
    const key = shift(keyUmlautedO)
    const result = metaResolver(key, key.key)
    t.is(result, "Ö")
})

const englishLayout = {
    "KeyP": {
        unmodified: "p",
        withShift: "P",
    },
}

const englishInternationalLayout = {
    "KeyS": {
        unmodified: "s",
        withShift: "S",
        withAltGraph: "ß",
        withAltGraphShift: "§",
    },
}

const germanLayout = {
    "Semicolon": {
        unmodified: "ö",
        withShift: "Ö",
    },
}

const createKeyEvent = (key: string, code: string): any => ({
    key,
    code,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    preventDefault: () => { }, // tslint:disable-line no-empty
})

const control = (keyEvent: KeyboardEvent): KeyboardEvent => ({
    ...keyEvent,
    ctrlKey: true,
})

const alt = (keyEvent: KeyboardEvent): KeyboardEvent => ({
    ...keyEvent,
    altKey: true,
})

const shift = (keyEvent: KeyboardEvent): KeyboardEvent => ({
    ...keyEvent,
    key: keyEvent.key.length === 1 ? keyEvent.key.toUpperCase() : keyEvent.key,
    shiftKey: true,
})

const keyBackSpace = createKeyEvent("Backspace", "Backspace")
const keyShift = shift(createKeyEvent("Shift", "Shift"))
const keyS = createKeyEvent("s", "KeyS")
const keyP = createKeyEvent("p", "KeyP")
const keyUmlautedO = createKeyEvent("ö", "Semicolon")
