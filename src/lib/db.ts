import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith("mongodb")
  ? process.env.DATABASE_URL
  : "mongodb://127.0.0.1:27017/civictrack?directConnection=true";

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
};

if (process.env.NODE_ENV === "development") {
  if (!globalForMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalForMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalForMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

async function getDb() {
  const c = await clientPromise;
  return c.db();
}

export interface DbUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DbDepartment {
  id: string;
  name: string;
  description?: string;
  complaints?: DbComplaint[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DbCategory {
  id: string;
  name: string;
  description?: string;
  departmentId?: string;
  department?: DbDepartment;
}

export interface DbComplaint {
  id: string;
  referenceCode: string;
  description: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  imageUrl?: string | null;
  status: string;
  confidenceScore?: number | null;
  resolutionNote?: string | null;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date | null;
  categoryId: string;
  departmentId: string;
  reportedById: string;
  category?: DbCategory;
  department?: DbDepartment;
  reportedBy?: Partial<DbUser>;
  statusUpdates?: any[];
}

export const db = {
  user: {
    async findUnique({ where }: { where: { email?: string; id?: string } }): Promise<DbUser | null> {
      const database = await getDb();
      const coll = database.collection("User");
      let query: any = {};
      if (where.email) query.email = where.email.toLowerCase().trim();
      if (where.id) {
        try {
          query._id = new ObjectId(where.id);
        } catch {
          query.id = where.id;
        }
      }
      const doc = await coll.findOne(query);
      if (!doc) return null;
      return {
        id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        passwordHash: doc.passwordHash,
        role: doc.role || "CITIZEN",
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
    },
    async create({ data, select }: { data: any; select?: any }): Promise<DbUser> {
      const database = await getDb();
      const coll = database.collection("User");
      const doc = {
        name: data.name,
        email: data.email.toLowerCase().trim(),
        passwordHash: data.passwordHash,
        role: data.role || "CITIZEN",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const res = await coll.insertOne(doc);
      return {
        id: res.insertedId.toString(),
        name: doc.name,
        email: doc.email,
        passwordHash: doc.passwordHash,
        role: doc.role,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
    },
  },
  department: {
    async findMany({ include }: any = {}): Promise<DbDepartment[]> {
      const database = await getDb();
      const coll = database.collection("Department");
      const docs = await coll.find({}).toArray();
      const depts: DbDepartment[] = docs.map((d: any) => ({
        id: d._id.toString(),
        name: d.name,
        description: d.description,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        complaints: [],
      }));

      if (include?.complaints) {
        const compColl = database.collection("Complaint");
        for (const dept of depts) {
          const comps = await compColl.find({ departmentId: dept.id }).toArray();
          dept.complaints = comps.map((c: any) => ({
            id: c._id.toString(),
            referenceCode: c.referenceCode,
            description: c.description,
            location: c.location,
            latitude: c.latitude,
            longitude: c.longitude,
            imageUrl: c.imageUrl,
            status: c.status,
            confidenceScore: c.confidenceScore,
            resolutionNote: c.resolutionNote,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
            resolvedAt: c.resolvedAt,
            categoryId: c.categoryId,
            departmentId: c.departmentId,
            reportedById: c.reportedById,
          }));
        }
      }
      return depts;
    },
    async findUnique({ where }: { where: { id?: string; name?: string } }): Promise<DbDepartment | null> {
      const database = await getDb();
      const coll = database.collection("Department");
      let query: any = {};
      if (where.name) query.name = where.name;
      if (where.id) {
        try {
          query._id = new ObjectId(where.id);
        } catch {
          query.id = where.id;
        }
      }
      const doc = await coll.findOne(query);
      if (!doc) return null;
      return {
        id: doc._id.toString(),
        name: doc.name,
        description: doc.description,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      };
    },
  },
  category: {
    async findMany({ include }: any = {}): Promise<DbCategory[]> {
      const database = await getDb();
      const coll = database.collection("Category");
      const docs = await coll.find({}).sort({ name: 1 }).toArray();
      const categories: DbCategory[] = docs.map((c: any) => ({
        id: c._id.toString(),
        name: c.name,
        description: c.description,
        departmentId: c.departmentId,
      }));

      if (include?.department) {
        const deptColl = database.collection("Department");
        for (const cat of categories) {
          if (cat.departmentId) {
            let deptObj: any = null;
            try {
              deptObj = await deptColl.findOne({ _id: new ObjectId(cat.departmentId) });
            } catch {
              deptObj = await deptColl.findOne({ id: cat.departmentId });
            }
            if (deptObj) {
              cat.department = {
                id: deptObj._id.toString(),
                name: deptObj.name,
                description: deptObj.description,
              };
            }
          }
        }
      }
      return categories;
    },
    async findUnique({ where, include }: { where: { id: string }; include?: any }): Promise<DbCategory | null> {
      const database = await getDb();
      const coll = database.collection("Category");
      let query: any = {};
      try {
        query._id = new ObjectId(where.id);
      } catch {
        query.id = where.id;
      }
      const doc = await coll.findOne(query);
      if (!doc) return null;
      const cat: DbCategory = {
        id: doc._id.toString(),
        name: doc.name,
        description: doc.description,
        departmentId: doc.departmentId,
      };

      if (include?.department && cat.departmentId) {
        const deptColl = database.collection("Department");
        let deptObj: any = null;
        try {
          deptObj = await deptColl.findOne({ _id: new ObjectId(cat.departmentId) });
        } catch {
          deptObj = await deptColl.findOne({ id: cat.departmentId });
        }
        if (deptObj) {
          cat.department = {
            id: deptObj._id.toString(),
            name: deptObj.name,
            description: deptObj.description,
          };
        }
      }
      return cat;
    },
    async findFirst({ include }: any = {}): Promise<DbCategory | null> {
      const database = await getDb();
      const coll = database.collection("Category");
      const doc = await coll.findOne({});
      if (!doc) return null;
      const cat: DbCategory = {
        id: doc._id.toString(),
        name: doc.name,
        description: doc.description,
        departmentId: doc.departmentId,
      };

      if (include?.department && cat.departmentId) {
        const deptColl = database.collection("Department");
        let deptObj: any = null;
        try {
          deptObj = await deptColl.findOne({ _id: new ObjectId(cat.departmentId) });
        } catch {}
        if (deptObj) {
          cat.department = {
            id: deptObj._id.toString(),
            name: deptObj.name,
            description: deptObj.description,
          };
        }
      }
      return cat;
    },
  },
  complaint: {
    async findMany({ where, include, orderBy }: any = {}): Promise<DbComplaint[]> {
      const database = await getDb();
      const coll = database.collection("Complaint");
      let query: any = {};
      if (where?.reportedById) query.reportedById = where.reportedById;
      if (where?.status) query.status = where.status;
      if (where?.departmentId) query.departmentId = where.departmentId;

      const cursor = coll.find(query);
      if (orderBy?.createdAt === "desc") cursor.sort({ createdAt: -1 });
      else if (orderBy?.createdAt === "asc") cursor.sort({ createdAt: 1 });

      const docs = await cursor.toArray();
      const complaints: DbComplaint[] = docs.map((c: any) => ({
        id: c._id.toString(),
        referenceCode: c.referenceCode,
        description: c.description,
        location: c.location,
        latitude: c.latitude,
        longitude: c.longitude,
        imageUrl: c.imageUrl,
        status: c.status,
        confidenceScore: c.confidenceScore,
        resolutionNote: c.resolutionNote,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        resolvedAt: c.resolvedAt,
        categoryId: c.categoryId,
        departmentId: c.departmentId,
        reportedById: c.reportedById,
      }));

      const catColl = database.collection("Category");
      const deptColl = database.collection("Department");
      const userColl = database.collection("User");
      const statusColl = database.collection("StatusUpdate");

      for (const comp of complaints) {
        if (include?.category && comp.categoryId) {
          let cat: any = null;
          try {
            cat = await catColl.findOne({ _id: new ObjectId(comp.categoryId) });
          } catch {
            cat = await catColl.findOne({ id: comp.categoryId });
          }
          if (cat) {
            comp.category = {
              id: cat._id.toString(),
              name: cat.name,
              description: cat.description,
              departmentId: cat.departmentId,
            };
          }
        }
        if (include?.department && comp.departmentId) {
          let dept: any = null;
          try {
            dept = await deptColl.findOne({ _id: new ObjectId(comp.departmentId) });
          } catch {
            dept = await deptColl.findOne({ id: comp.departmentId });
          }
          if (dept) {
            comp.department = {
              id: dept._id.toString(),
              name: dept.name,
              description: dept.description,
            };
          }
        }
        if (include?.reportedBy && comp.reportedById) {
          let u: any = null;
          try {
            u = await userColl.findOne({ _id: new ObjectId(comp.reportedById) });
          } catch {
            u = await userColl.findOne({ id: comp.reportedById });
          }
          if (u) {
            comp.reportedBy = {
              id: u._id.toString(),
              name: u.name,
              email: u.email,
            };
          }
        }
        if (include?.statusUpdates) {
          const updates = await statusColl
            .find({ complaintId: comp.id })
            .sort({ createdAt: 1 })
            .toArray();
          comp.statusUpdates = updates.map((su: any) => ({ ...su, id: su._id.toString() }));
        }
      }
      return complaints;
    },
    async findUnique({ where, include }: { where: { id: string }; include?: any }): Promise<DbComplaint | null> {
      const database = await getDb();
      const coll = database.collection("Complaint");
      let query: any = {};
      try {
        query._id = new ObjectId(where.id);
      } catch {
        query.id = where.id;
      }
      const doc = await coll.findOne(query);
      if (!doc) return null;

      const comp: DbComplaint = {
        id: doc._id.toString(),
        referenceCode: doc.referenceCode,
        description: doc.description,
        location: doc.location,
        latitude: doc.latitude,
        longitude: doc.longitude,
        imageUrl: doc.imageUrl,
        status: doc.status,
        confidenceScore: doc.confidenceScore,
        resolutionNote: doc.resolutionNote,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        resolvedAt: doc.resolvedAt,
        categoryId: doc.categoryId,
        departmentId: doc.departmentId,
        reportedById: doc.reportedById,
      };

      const catColl = database.collection("Category");
      const deptColl = database.collection("Department");
      const userColl = database.collection("User");
      const statusColl = database.collection("StatusUpdate");

      if (include?.category && comp.categoryId) {
        let cat: any = null;
        try {
          cat = await catColl.findOne({ _id: new ObjectId(comp.categoryId) });
        } catch {
          cat = await catColl.findOne({ id: comp.categoryId });
        }
        if (cat) {
          comp.category = {
            id: cat._id.toString(),
            name: cat.name,
            description: cat.description,
            departmentId: cat.departmentId,
          };
        }
      }
      if (include?.department && comp.departmentId) {
        let dept: any = null;
        try {
          dept = await deptColl.findOne({ _id: new ObjectId(comp.departmentId) });
        } catch {
          dept = await deptColl.findOne({ id: comp.departmentId });
        }
        if (dept) {
          comp.department = {
            id: dept._id.toString(),
            name: dept.name,
            description: dept.description,
          };
        }
      }
      if (include?.reportedBy && comp.reportedById) {
        let u: any = null;
        try {
          u = await userColl.findOne({ _id: new ObjectId(comp.reportedById) });
        } catch {
          u = await userColl.findOne({ id: comp.reportedById });
        }
        if (u) {
          comp.reportedBy = {
            id: u._id.toString(),
            name: u.name,
            email: u.email,
          };
        }
      }
      if (include?.statusUpdates) {
        const updates = await statusColl
          .find({ complaintId: comp.id })
          .sort({ createdAt: 1 })
          .toArray();
        comp.statusUpdates = updates.map((su: any) => ({ ...su, id: su._id.toString() }));
      }
      return comp;
    },
    async create({ data, include }: { data: any; include?: any }): Promise<DbComplaint | null> {
      const database = await getDb();
      const coll = database.collection("Complaint");
      const statusColl = database.collection("StatusUpdate");

      const compDoc: any = {
        referenceCode: data.referenceCode,
        description: data.description,
        location: data.location,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        imageUrl: data.imageUrl ?? null,
        status: data.status || "SUBMITTED",
        confidenceScore: data.confidenceScore ?? null,
        resolutionNote: data.resolutionNote ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
        resolvedAt: null,
        categoryId: data.categoryId,
        departmentId: data.departmentId,
        reportedById: data.reportedById,
      };

      const res = await coll.insertOne(compDoc);
      const insertedId = res.insertedId.toString();

      if (data.statusUpdates?.create) {
        await statusColl.insertOne({
          complaintId: insertedId,
          status: data.statusUpdates.create.status || "SUBMITTED",
          note: data.statusUpdates.create.note || null,
          createdAt: new Date(),
        });
      }

      return db.complaint.findUnique({ where: { id: insertedId }, include });
    },
    async update({ where, data, include }: { where: { id: string }; data: any; include?: any }): Promise<DbComplaint | null> {
      const database = await getDb();
      const coll = database.collection("Complaint");
      const statusColl = database.collection("StatusUpdate");

      let query: any = {};
      try {
        query._id = new ObjectId(where.id);
      } catch {
        query.id = where.id;
      }

      const updateFields: any = { updatedAt: new Date() };
      if (data.status) updateFields.status = data.status;
      if (data.resolutionNote !== undefined) updateFields.resolutionNote = data.resolutionNote;
      if (data.resolvedAt !== undefined) updateFields.resolvedAt = data.resolvedAt;

      await coll.updateOne(query, { $set: updateFields });

      if (data.statusUpdates?.create) {
        await statusColl.insertOne({
          complaintId: where.id,
          status: data.statusUpdates.create.status || data.status,
          note: data.statusUpdates.create.note || null,
          createdAt: new Date(),
        });
      }

      return db.complaint.findUnique({ where: { id: where.id }, include });
    },
    async count() {
      const database = await getDb();
      return database.collection("Complaint").countDocuments();
    },
  },
};