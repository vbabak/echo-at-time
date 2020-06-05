Redis
===

Assume you have docker (v >= 18) and docker-compose installed.

### Run
Update `.env` file with required redis password (if needed). 

If you do not need RedisAdmin UI, comment out `redisadmin` section in `docker-compose.yml`.

Start services

```bash
docker-compose up -d
```

Redis is configured with enabled persistance to survive through restarts.

### Remove containers

To clean-up your system from created containers, run

```bash
docker-compose down
```

Base images will be kept.
