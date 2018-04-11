export const isCiBuild = () => {
    const ciBuild = !!(
        process.env.ONI_AUTOMATION_USE_DIST_BUILD ||
        process.env.CONTINUOUS_INTEGRATION /* set by travis */ ||
        process.env.APPVEYOR
    ) /* set by appveyor */
    return ciBuild
}
