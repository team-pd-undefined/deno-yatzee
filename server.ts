import { serve } from "https://deno.land/std/http/server.ts";

class SsemiServer {
    async listen(port: number, callback: Function) {
        try {
            const s = serve(`0.0.0.0:${port}`);
            callback();
            for await (const request of s) {
                if(request.url === "/home") {
                    request.respond({ body: new TextEncoder().encode("Hello Home\n") });
                } else if(request.url === "/page") {
                    request.respond({ body: new TextEncoder().encode("Hello Page\n") });
                } else {
                    request.respond({ body: new TextEncoder().encode("Hello Root\n") });
                }
            }
        } catch(e) {
            console.log(e);
        }
    }
}

function main() {
    const port = Number.parseInt(Deno.args[1]) || 8000;
    const server = new SsemiServer();
    server.listen(port, () => {
        console.log(`Listen to ${port}`)
    });
}

main();

//import * as testing from "https://deno.land/x/std/testing/mod.ts";
// byechoi push test