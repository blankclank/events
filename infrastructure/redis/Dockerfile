FROM redis:5.0.5-alpine

ARG CONFIG

COPY ${CONFIG} /usr/local/etc/redis/redis.conf
CMD [ "redis-server", "/usr/local/etc/redis/redis.conf" ]
