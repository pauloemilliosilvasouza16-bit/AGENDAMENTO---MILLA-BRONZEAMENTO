* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: Arial, sans-serif;
    background: #f7f0eb;
    color: #2d211b;
}

.topo {
    background: #321f15;
    padding: 30px 20px;
    text-align: center;
}

.logo {
    color: #d8b06a;
    font-size: 42px;
    font-weight: bold;
    letter-spacing: 4px;
}

.logo span {
    display: block;
    font-size: 30px;
    font-weight: normal;
    letter-spacing: 1px;
}

.container {
    max-width: 700px;
    margin: 40px auto;
    padding: 0 20px;
}

.card {
    background: white;
    padding: 45px;
    border-radius: 20px;
    box-shadow: 0 5px 25px rgba(0,0,0,0.08);
}

h1 {
    text-align: center;
    font-size: 40px;
    margin-bottom: 12px;
}

.subtitulo {
    text-align: center;
    color: #777;
    font-size: 20px;
    margin-bottom: 40px;
}

label {
    display: block;
    font-size: 18px;
    font-weight: bold;
    margin-top: 25px;
    margin-bottom: 10px;
}

select,
input {
    width: 100%;
    padding: 17px;
    border: 1px solid #ddd;
    border-radius: 10px;
    font-size: 17px;
    background: white;
}

select:disabled {
    background: #f5f5f5;
    color: #999;
}

button {
    width: 100%;
    margin-top: 35px;
    padding: 18px;
    border: none;
    border-radius: 10px;
    background: #43291d;
    color: white;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
}

button:hover {
    opacity: 0.9;
}

.seguranca {
    text-align: center;
    margin-top: 30px;
    color: #777;
}

footer {
    text-align: center;
    padding: 35px;
    color: #555;
}

@media (max-width: 600px) {

    .logo {
        font-size: 32px;
    }

    .logo span {
        font-size: 23px;
    }

    .card {
        padding: 25px 20px;
    }

    h1 {
        font-size: 30px;
    }

    .subtitulo {
        font-size: 17px;
    }
}
