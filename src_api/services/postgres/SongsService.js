const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const mapDBToModelForSingleSong = require('../../utils/model/SongModel');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title, year, performer, genre, duration, albumId,
  }) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs() {
    const { rows } = await this._pool.query('SELECT id, title, performer FROM songs');
    return rows;
  }

  async getSongById(songId) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return result.rows.map(mapDBToModelForSingleSong)[0];
  }

  async getSongByAlbumId(albumId) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE album_id = $1',
      values: [albumId],
    };
    const result = await this._pool.query(query);

    return result.rows;
  }

  async editSongById(
    songId,
    title,
    year,
    performer,
    genre,
    duration,
    albumId,
  ) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, album_id = $6, updated_at = $7 WHERE id = $8 RETURNING id',
      values: [title, year, performer, genre, duration, albumId, updatedAt, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui lagu, id tidak ditemukan');
    }
  }

  async deleteSongById(songId) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [songId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus lagu, id tidak ditemukan');
    }
  }

  async verifySongIsExist(songId) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }
  }
}

module.exports = SongsService;
