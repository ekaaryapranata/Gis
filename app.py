from flask import Flask, jsonify, render_template, request, redirect, url_for, send_from_directory
import os  # Menambahkan os untuk mengakses path folder
from flask_cors import CORS
import mysql.connector
from werkzeug.security import check_password_hash, generate_password_hash

app = Flask(__name__)

app.secret_key = 'magangbang'  # Kunci rahasia untuk session
CORS(app)  # Mengizinkan CORS untuk semua domain

# Koneksi ke database MySQL
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="sekolah"
    )

# Menambahkan route untuk melayani file di folder assets
@app.route('/assets/<path:filename>')
def serve_assets(filename):
    return send_from_directory(os.path.join(app.root_path, 'assets'), filename)

# API untuk mengambil data sekolah
@app.route('/api/sekolah', methods=['GET'])
def get_sekolah():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM daftar_nama")
    results = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(results)

# Route untuk menambah sekolah
@app.route('/admin/add_school', methods=['POST'])
def add_school():
    if request.method == 'POST':
        school_name = request.form['school_name']
        latitude = request.form['latitude']
        longitude = request.form['longitude']
        image_name = request.form['image_name']

        # Menambahkan data ke database
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO daftar_nama (sekolah, latitude, longitude, nama_gambar) VALUES (%s, %s, %s, %s)",
            (school_name, latitude, longitude, image_name)
        )
        conn.commit()
        cursor.close()
        conn.close()

        return redirect(url_for('admin_dashboard'))

# Route untuk menampilkan halaman dashboard admin
@app.route('/admin/dashboard')
def admin_dashboard():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM daftar_nama")
    schools = cursor.fetchall()
    cursor.close()
    conn.close()
    return render_template('admin_dashboard.html', schools=schools)

# Route untuk mengedit data sekolah
@app.route('/admin/edit_school/<int:id>', methods=['GET', 'POST'])
def edit_school(id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM daftar_nama WHERE no = %s", (id,))
    school = cursor.fetchone()

    if request.method == 'POST':
        school_name = request.form['school_name']
        latitude = request.form['latitude']
        longitude = request.form['longitude']
        image_name = request.form['image_name']

        cursor.execute(
            "UPDATE daftar_nama SET sekolah = %s, latitude = %s, longitude = %s, nama_gambar = %s WHERE no = %s",
            (school_name, latitude, longitude, image_name, id)
        )
        conn.commit()
        cursor.close()
        conn.close()

        return redirect(url_for('admin_dashboard'))

    cursor.close()
    conn.close()
    return render_template('edit_school.html', school=school)

# Route untuk menghapus data sekolah
@app.route('/admin/delete_school/<int:id>', methods=['GET'])
def delete_school(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM daftar_nama WHERE no = %s", (id,))
    conn.commit()
    cursor.close()
    conn.close()
    
    return redirect(url_for('admin_dashboard'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        # Enkripsi password menggunakan pbkdf2:sha256
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        
        # Menyimpan pengguna baru ke database
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, hashed_password))
        conn.commit()
        cursor.close()
        conn.close()
        
        return redirect('/login')  # Redirect ke halaman login setelah registrasi berhasil
    return render_template('register.html')  # Menampilkan halaman registrasi


# Route untuk login
# Route untuk login
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        # Memeriksa apakah username ada di tabel admin
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM admin WHERE username = %s", (username,))
        admin = cursor.fetchone()

        # Jika admin ditemukan dan password cocok
        if admin and check_password_hash(admin['password'], password):
            session['admin_id'] = admin['id']  # Simpan informasi admin di session
            session['username'] = admin['username']  # Simpan username di session
            return redirect(url_for('admin_dashboard'))  # Mengarahkan ke halaman admin dashboard
        
        # Jika tidak ditemukan di tabel admin, periksa di tabel users
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()
        
        if user and check_password_hash(user['password'], password):
            session['user_id'] = user['id']  # Simpan informasi user di session
            session['username'] = user['username']  # Simpan username di session
            return redirect(url_for('home'))  # Mengarahkan ke halaman index.html (untuk user)
        
        # Jika login gagal, tampilkan pesan kesalahan
        return render_template('login.html', error="Login failed! Please check your credentials.")
    
    return render_template('login.html')  # Menampilkan halaman login

# Route untuk halaman utama setelah login
@app.route('/')
def home():
    # Pastikan variabel logged_in dan username ada dalam session
    logged_in = 'user_id' in session or 'admin_id' in session
    username = session.get('username', '')  # Ambil username jika ada dalam session
    return render_template('index.html', logged_in=logged_in, username=username)


from flask import session

@app.route('/logout')
def logout():
    session.pop('user_id', None)  # Menghapus user_id dari session
    session.pop('admin_id', None)  # Menghapus admin_id dari session
    session.pop('username', None)  # Menghapus username dari session
    return redirect('/login')  # Redirect ke halaman login setelah logout


# @app.route('/admin/add_admin', methods=['GET', 'POST'])
#  def add_admin():
#     if request.method == 'POST':
#         username = request.form['username']
#         password = request.form['password']
        
#         # Hash password menggunakan pbkdf2:sha256
#         hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
        
#         # Menyimpan admin baru ke dalam tabel admin
#         conn = get_db_connection()
#         cursor = conn.cursor()
#         cursor.execute("INSERT INTO admin (username, password) VALUES (%s, %s)", (username, hashed_password))
#         conn.commit()
#         cursor.close()
#         conn.close()
        
#         return redirect(url_for('admadd_admin.htmlin_dashboard'))  # Redirect ke dashboard admin setelah sukses

#     return render_template('add_admin.html')  # Halaman untuk menambahkan admin baru


if __name__ == '__main__':
    app.run(debug=True)
