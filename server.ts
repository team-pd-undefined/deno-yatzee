import { serve, ServerRequest, Response } from "https://deno.land/std/http/server.ts";

type RegistrationState = 'Pre' | 'Process' | 'Error'
type MiddlewareType = (request: ServerRequest, response: Response, middleware: Middleware) => {}
type ErrorMiddlewareType = (ErrorFunction: Function, request: ServerRequest, response: Response, middleware: Middleware) => {}
type Middleware = MiddlewareType | ErrorMiddlewareType


class SsemiServer {
    private preMiddlewares: MiddlewareType[] = [];
    private processMiddlewares: WeakMap<String, MiddlewareType[]> = new WeakMap();
    private errorMiddlewares: ErrorMiddlewareType[] = [];
    private registrationState: RegistrationState = 'Pre';

    isMiddlewareType(middleware: Middleware) : middleware is MiddlewareType {
        return this.registrationState !== 'Error';
    }

    use(uri: string | Middleware, middleware?: Middleware) {
        if (typeof uri !== 'string') {
            middleware = uri;
            uri = undefined;
        }
        if (uri != undefined && this.registrationState === 'Pre') {
            this.registrationState = 'Process';
        }
        if (uri == undefined && this.registrationState === 'Process') {
            this.registrationState = 'Error';
        }
        if (this.isMiddlewareType(middleware)) {
            if (this.registrationState === 'Pre') {
                this.preMiddlewares.push(middleware);
            } else {
                const middlewares = this.processMiddlewares.get(uri) || [];
                middlewares.push(middleware);
                this.processMiddlewares.set(uri, middlewares);
            }
        } else {
            this.errorMiddlewares.push(middleware);
        }
    }
    
    async listen(port: number, callback: Function) {
        try {
            const s = serve(`0.0.0.0:${port}`);
            callback();
            for await (const request of s) {
                if(request.url === "/home") {
                    for( let i = 0; i < this._middlewares.length-1; i++ ){
                        const before = this._middlewares[i]
                        if( isMiddlewareType(before) ) {
                            const next = this._middlewares[i+1]
                            const response = {
                                status: 200,
                                headers: request.headers
                            }
                            before(request, response, next)
                        }
                    }
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
// byechoi push test()