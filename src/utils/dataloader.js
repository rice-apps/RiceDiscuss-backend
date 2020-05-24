import { ObjectTypeComposer } from 'graphql-compose';
import DataLoader from 'dataloader';
import crypto from 'crypto';
import assert from 'assert';

const md5 = (str) => crypto.createHash('md5').update(str).digest("hex");

function getHashKey(key) {
    let object = {};

    Object.assign(object,
        { args: key.args || {} },
        { projection: key.projection || {} },
        { rawQuery: JSON.stringify(key.rawQuery || {}) },
        { context: JSON.stringify(key.context || {}) });

    let hash = md5(JSON.stringify(object));

    return hash;
}

function composeDataloader(tc, resNames, options) {
    if (!(tc instanceof ObjectTypeComposer)) {
        throw new Error("Provide TypeComposer to composeDataloader function!");
    }

    assert(Array.isArray(resNames), "Resolver names should be provided as array of strings");

    const safeOptions = {
        cacheExpiration: options.cacheExpiration || 300,
        removeProjection: options.removeProjection || true,
        debug: options.debug || false,
    };

    for (let i = 0; i < resNames.length; i++) {
        let cachedResolver = tc.getResolver(resNames[i]);
        let resLoader = new DataLoader((resolveParamsArray) =>
            new Promise((resolve, _) => {
                if (safeOptions.debug) {
                    console.log(`New db request (${resNames[i]})`);
                }

                resolve(resolveParamsArray.map(rp => cachedResolver.resolve(rp)));
            }),
            {
                cacheKeyFn: key => {
                    let newKey = getHashKey(key);
                    return newKey;
                }
            });

        tc.setResolver(resNames[i],
            cachedResolver.wrapResolve(_ => rp => {
                if (safeOptions.removeProjection) {
                    delete rp.projection;
                }

                setTimeout(() => {
                    resLoader.clear(rp)
                }, safeOptions.cacheExpiration)

                return resLoader.load(rp);
            }));
    }

    return tc;
}

export default composeDataloader;
