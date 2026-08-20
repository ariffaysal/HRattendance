# Attendance PostgreSQL image.
#
# The init schema is copied INTO the image instead of bind-mounted because
# Docker Desktop on Windows cannot mount a single host file into a container
# (fails with "OCI runtime create failed ... error mounting ..."). Baking it
# in is portable and needs no host file sharing.
FROM postgres:16-alpine
COPY init-postgres.sql /docker-entrypoint-initdb.d/01-init-postgres.sql
