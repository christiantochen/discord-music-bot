import {
	MongoClient,
	Db,
	Filter,
	InsertOneResult,
	ModifyResult,
	DeleteResult
} from "mongodb";
import Client from "./client";

export type DatabaseCollection = "guilds";

export default class Database {
	readonly client: Client;
	private mongo: MongoClient;
	private db: Db | undefined;

	constructor(client: Client) {
		this.client = client;
		this.mongo = new MongoClient(process.env.MONGO_URI!);
		this.init();
	}

	private async init() {
		await this.mongo.connect();
		this.db = this.mongo.db(process.env.MONGO_DB!);
	}

	async get(
		collection: DatabaseCollection,
		filter: Filter<any>
	): Promise<any | undefined> {
		return this.db?.collection(collection).findOne(filter);
	}

	async getAll(collection: DatabaseCollection): Promise<any[] | undefined> {
		return this.db?.collection(collection).find<any>({}).toArray();
	}

	async insert(
		collection: DatabaseCollection,
		data: any
	): Promise<InsertOneResult<any> | string | undefined> {
		return this.db?.collection(collection).insertOne(data);
	}

	async update(
		collection: DatabaseCollection,
		filter: Filter<any>,
		data: any
	): Promise<ModifyResult | undefined> {
		return this.db
			?.collection(collection)
			.findOneAndUpdate(
				filter,
				{ $set: data },
				{ upsert: true, returnDocument: "after" }
			);
	}

	async delete(
		collection: DatabaseCollection,
		filter: Filter<any>
	): Promise<DeleteResult | undefined> {
		return this.db?.collection(collection).deleteOne(filter);
	}
}
