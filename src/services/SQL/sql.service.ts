import { MySql2Database, drizzle } from 'drizzle-orm/mysql2';
import mysql, { Pool } from 'mysql2/promise';
import { log } from '~/helpers';
import { SqlConnectionConfig } from './type';

class SQLService {
    private static instance: SQLService;
    private connections: { [key: string]: Pool; } = {};

    private constructor(private connectionConfig: SqlConnectionConfig) { }

    public static getInstance(connectionConfig: SqlConnectionConfig): SQLService {
        if (!SQLService.instance) {
            SQLService.instance = new SQLService(connectionConfig);
        }
        return SQLService.instance;
    }

    public getConnection(name: string, schema: Record<string, unknown> | undefined)
        : MySql2Database<Record<string, unknown>> {
        if (this.connections[name]) {
            return drizzle(this.connections[name], { schema, mode: 'default' });
        } else if (this.connectionConfig[name]) {
            const poolConnection = mysql.createPool(this.connectionConfig[name]);
            this.connections[name] = poolConnection;
            return drizzle(poolConnection, { schema, mode: 'default' });
        } else {
            throw new Error(`Connection with name '${name}' not found in configuration.`);
        }
    }

    public async closeConnections(): Promise<void> {
        const connectionNames = Object.keys(this.connections);
        for (const name of connectionNames) {
            log(`Closing db connection '${name}'...`);
            await this.connections[name].end();
        }

        this.connections = {};
    }
}

export default SQLService.getInstance;