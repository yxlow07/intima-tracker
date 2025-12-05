-- Activity Table
CREATE TABLE IF NOT EXISTS Activity (
    id TEXT PRIMARY KEY,
    activityName TEXT NOT NULL,
    description TEXT,
    activityDate DATETIME,
    activityType TEXT,
    affiliate TEXT,
    status TEXT NOT NULL DEFAULT 'Pending',
    publicViewCount INTEGER NOT NULL DEFAULT 0,
    uniqueToken TEXT NOT NULL UNIQUE,
    formType TEXT NOT NULL DEFAULT 'SAP',
    sapActivityId TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sapActivityId) REFERENCES Activity(id) ON DELETE SET NULL
);

-- Logs Table
CREATE TABLE IF NOT EXISTS Logs (
    id TEXT PRIMARY KEY,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    log TEXT,
    activityId TEXT NOT NULL,
    FOREIGN KEY (activityId) REFERENCES Activity(id) ON DELETE CASCADE
);

-- Affiliate Ideas Table
CREATE TABLE IF NOT EXISTS AffiliateIdea (
    id TEXT PRIMARY KEY,
    affiliateName TEXT NOT NULL,
    description TEXT,
    positionsOpen TEXT,
    contact TEXT NOT NULL,
    studentEmail TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending Approval',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
