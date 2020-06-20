import DataLoader from "dataloader";
import { ObjectTypeComposer } from "graphql-compose";
import crypto from "crypto";

function composeDataloader(tc, resNames, options) {
    if (!(tc instanceof ObjectTypeComposer)) {
        throw new Error(
            "Provide ObjectTypeComposer to composeDataloader function!",
        );
    }

    const safeOptions = {
        cacheExpiration: options.cacheExpiration || 300,
        removeProjection: options.removeProjection || true,
        debug: options.debug || false,
    };

    for (let i = 0; i < resNames.length; i++) {
        const cachedResolver = tc.getResolver(resNames[i]);
        const resLoader = new DataLoader(
            (resolveParamsArray) =>
                new Promise((resolve, _) => {
                    if (safeOptions.debug) {
                        console.log(`New db request (${resNames[i]})`);
                    }

                    resolve(
                        resolveParamsArray.map((rp) =>
                            cachedResolver.resolve(rp),
                        ),
                    );
                }),
            {
                cacheKeyFn: (key) => {
                    const newKey = getHashKey(key);
                    return newKey;
                },
            },
        );

        tc.setResolver(
            resNames[i],
            cachedResolver.wrapResolve((_) => (rp) => {
                if (safeOptions.removeProjection) {
                    delete rp.projection;
                }

                setTimeout(() => {
                    resLoader.clear(rp);
                }, safeOptions.cacheExpiration);

                return resLoader.load(rp);
            }),
        );
    }

    return tc;
}

function getHashKey(key) {
    const object = {};

    Object.assign(
        object,
        { args: key.args || {} },
        { projection: key.projection || {} },
        { rawQuery: JSON.stringify(key.rawQuery || {}) },
        { context: JSON.stringify(key.context || {}) },
    );

    return md5(JSON.stringify(object));
}

function md5(obj) {
    return crypto.createHash("md5").update(obj).digest("hex");
}

export default composeDataloader;
