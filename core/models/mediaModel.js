const db = require('../utils/database');

const insert = ({storage = 'local', path, target, target_id, image_order = 0}) => {
    return new Promise((resolve, reject) => {
        const insert = {
            storage,
            path,
            target,
            target_id,
            image_order
        };
        db.query(`INSERT INTO media SET ?`, [insert], (err, result) => {
            if (err) throw err;
            insert.id = result.insertId;
            resolve(insert);
        });
    });
};

const deleteBefore = (id, target, target_id) => {
    return new Promise(resolve => {
        const update = {
            is_deleted: 1
        };
        db.query(`UPDATE media SET ? WHERE target = ? AND target_id = ? AND id < ?`, [update, target, target_id, id], (err, result) => {
            if (err) throw err;
            resolve(true);
        })
    });
}

const get = (target, target_id) => {
    return new Promise(resolve => {
        db.query(`SELECT * FROM media WHERE target = ? AND target_id = ? AND is_deleted = 0 ORDER BY image_order ASC, id DESC`, [target, target_id], (err, result) => {
            if (err) throw err;

            resolve(result);
        })
    });
}

const displayOrder = (imageIds = [], target, target_id) => {
    if (imageIds.length > 0) {
        console.info("@@@@@@@@@@@@ displayOrder mediaModel images:: ", imageIds);
        return new Promise(resolve => {
            let str = '', i = 0;
            for (let id of imageIds) {
                str += `WHEN ${id} THEN ${++i} `
            }
            db.query(`UPDATE media SET image_order = CASE id ${str} ELSE image_order END WHERE id IN(?)/* AND (target = ? AND target_id = ?)*/`, [imageIds/*, target, target_id*/], (err, result) => {
                if (err) throw err;
                resolve(result);
            })
        });
    }
}

module.exports = {
    insert,
    deleteBefore,
    get,
    displayOrder
};