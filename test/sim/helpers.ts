export abstract class Simulation {
    consructor() {}

    async abstract before();
    async abstract after();

    async abstract sim();
    
    async run() {
        await this.before()
        await this.sim()
        await this.after()
    }
}