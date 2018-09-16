it.only('should request the bootstrap and bundle code', async () => {
    let bootstrap = trackResponseLoaded(page, `${webappServerAddr.url()}/turbo.js`).then(response => {
        assert(!response.fromCache());
        return Promise.resolve();
    })

    let bundle = trackResponseLoaded(page, `${bundleServerAddr.url()}/bundles/bundle.js`).then(response => {
        assert(!response.fromCache());
        // console.log(response.request().headers())
        return Promise.resolve();
    })

    await page.goto(webappServerAddr.url(), { waitUntil: ['domcontentloaded', 'networkidle2'] });
    
    return Promise.all([
        assert.isFulfilled(bootstrap),
        assert.isFulfilled(bundle),
    ]);
});

// this.timeout(0)
it('should not request the bundle again',  async () => {
    // debugBrowser(done);
    // First load.
    await page.goto(webappServerAddr.url(), { waitUntil: ['domcontentloaded', 'networkidle2'] });

    let resourcesLoaded = {};
    page.on('response', async (response) => {
        let k = response.request().url();
        resourcesLoaded[k] = await response.buffer();
    });

    let bootstrap = trackResponseLoaded(page, `${webappServerAddr.url()}/turbo.js`).then(response => {
        assert(!response.fromCache());
        return Promise.resolve();
    })

    let bundle = trackResponseLoaded(page, `${bundleServerAddr.url()}/bundles/bed6d13123a490`).then(response => {
        assert(!response.fromCache());
        return Promise.resolve();
    })

    // Second load
    await page.goto(webappServerAddr.url(), { waitUntil: ['domcontentloaded', 'networkidle2'] });
    
    await Promise.all([
        bootstrap,
        bundle,
    ]);
    
    // console.log(resourcesLoaded)

    // assert.strictEqual(resourcesLoaded[`${bundleServerAddr.url()}/merkle-ast-client-bundle`], undefined, "don't reload merkle client");
    assert.strictEqual(resourcesLoaded[`${bundleServerAddr.url()}/bundle-diffs/bundle.js/by-root/undefined`], undefined, "should load the bundle from its tree hash, not from undefined");
    assert.notStrictEqual(resourcesLoaded[`${bundleServerAddr.url()}/bundle-diffs/bundle.js/by-root/bed6d13123a490`], undefined, "bundle diff should be loaded");

    return await Promise.all([]);
})



it(`should load a diff of the new bundle code`, async () => {
    // First load
    // ----------

    shell.cp('example1.js', 'bundle.js')
    await page.goto(webappServerAddr.url(), { waitUntil: ['domcontentloaded', 'networkidle2'] });

    // let bundle = trackResponseLoaded(page, `${bundleServerAddr.url()}/bundle-diffs/bundle.js/by-root/bed6d13123a490`).then(response => {
    //     assert(!response.fromCache());
    //     return Promise.resolve();
    // })


    // Second load
    // -----------

    let resourcesLoaded = {};
    page.on('response', async (response) => {
        let k = response.request().url();
        resourcesLoaded[k] = await response.buffer();
    });

    let serverReload = new Q.defer();
    AstexServer.events.on('reloaded', (ev) => {
        serverReload.resolve()
    })
    shell.cp('example2.js', 'bundle.js')
    await serverReload.promise;
    
    // let bundle = trackResponseLoaded(page, `${bundleServerAddr.url()}/bundle-diffs/bundle.js/by-root/bed6d13123a490`).then(response => {
    //     assert(!response.fromCache());
    //     return Promise.resolve();
    // })

    await page.goto(webappServerAddr.url(), { waitUntil: ['domcontentloaded', 'networkidle2'] });

    assert.notStrictEqual(
        resourcesLoaded[`${bundleServerAddr.url()}/bundle-diffs/bundle.js/by-root/bed6d13123a490`], 
        undefined, 
        "bundle should be loaded from previous root"
    );

    return await Promise.all([]);
})