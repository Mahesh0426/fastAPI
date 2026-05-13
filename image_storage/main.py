import uvicorn
# from app.app import app 



def main():
    uvicorn.run("app.app:app", host="0.0.0.0", port=8000, reload=True)
     # import app from app folder in side app.py


    #other way to run uvicorn is to directly import app and then run it
    #  uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
     #to run this - uv run uvicorn main:app --reload     


if __name__ == "__main__":
    main()
