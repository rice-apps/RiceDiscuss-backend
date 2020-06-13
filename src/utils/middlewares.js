async function checkLoggedIn(resolve, source, args, context, info) {
    if (context.netID) {
        return await resolve(source, args, context, info);
    }

    throw new Error("Not logged in!");
}

export { checkLoggedIn };
