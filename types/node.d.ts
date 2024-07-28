import MainApplication from "@/lib/classes/MainApplication";

declare global {
    namespace NodeJS {
        interface Process {
            app: MainApplication
        }
    }
}