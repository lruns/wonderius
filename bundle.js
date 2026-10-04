"use strict";
(() => {
  // node_modules/d3-array/src/fsum.js
  var Adder = class {
    constructor() {
      this._partials = new Float64Array(32);
      this._n = 0;
    }
    add(x) {
      const p = this._partials;
      let i = 0;
      for (let j = 0; j < this._n && j < 32; j++) {
        const y = p[j], hi = x + y, lo = Math.abs(x) < Math.abs(y) ? x - (hi - y) : y - (hi - x);
        if (lo) p[i++] = lo;
        x = hi;
      }
      p[i] = x;
      this._n = i + 1;
      return this;
    }
    valueOf() {
      const p = this._partials;
      let n = this._n, x, y, lo, hi = 0;
      if (n > 0) {
        hi = p[--n];
        while (n > 0) {
          x = hi;
          y = p[--n];
          hi = x + y;
          lo = y - (hi - x);
          if (lo) break;
        }
        if (n > 0 && (lo < 0 && p[n - 1] < 0 || lo > 0 && p[n - 1] > 0)) {
          y = lo * 2;
          x = hi + y;
          if (y == x - hi) hi = x;
        }
      }
      return hi;
    }
  };

  // node_modules/d3-array/src/merge.js
  function* flatten(arrays) {
    for (const array2 of arrays) {
      yield* array2;
    }
  }
  function merge(arrays) {
    return Array.from(flatten(arrays));
  }

  // node_modules/d3-array/src/range.js
  function range(start2, stop, step) {
    start2 = +start2, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start2, start2 = 0, 1) : n < 3 ? 1 : +step;
    var i = -1, n = Math.max(0, Math.ceil((stop - start2) / step)) | 0, range2 = new Array(n);
    while (++i < n) {
      range2[i] = start2 + i * step;
    }
    return range2;
  }

  // node_modules/d3-geo/src/math.js
  var epsilon = 1e-6;
  var epsilon2 = 1e-12;
  var pi = Math.PI;
  var halfPi = pi / 2;
  var quarterPi = pi / 4;
  var tau = pi * 2;
  var degrees = 180 / pi;
  var radians = pi / 180;
  var abs = Math.abs;
  var atan = Math.atan;
  var atan2 = Math.atan2;
  var cos = Math.cos;
  var ceil = Math.ceil;
  var sin = Math.sin;
  var sign = Math.sign || function(x) {
    return x > 0 ? 1 : x < 0 ? -1 : 0;
  };
  var sqrt = Math.sqrt;
  function acos(x) {
    return x > 1 ? 0 : x < -1 ? pi : Math.acos(x);
  }
  function asin(x) {
    return x > 1 ? halfPi : x < -1 ? -halfPi : Math.asin(x);
  }

  // node_modules/d3-geo/src/noop.js
  function noop() {
  }

  // node_modules/d3-geo/src/stream.js
  function streamGeometry(geometry, stream) {
    if (geometry && streamGeometryType.hasOwnProperty(geometry.type)) {
      streamGeometryType[geometry.type](geometry, stream);
    }
  }
  var streamObjectType = {
    Feature: function(object, stream) {
      streamGeometry(object.geometry, stream);
    },
    FeatureCollection: function(object, stream) {
      var features = object.features, i = -1, n = features.length;
      while (++i < n) streamGeometry(features[i].geometry, stream);
    }
  };
  var streamGeometryType = {
    Sphere: function(object, stream) {
      stream.sphere();
    },
    Point: function(object, stream) {
      object = object.coordinates;
      stream.point(object[0], object[1], object[2]);
    },
    MultiPoint: function(object, stream) {
      var coordinates = object.coordinates, i = -1, n = coordinates.length;
      while (++i < n) object = coordinates[i], stream.point(object[0], object[1], object[2]);
    },
    LineString: function(object, stream) {
      streamLine(object.coordinates, stream, 0);
    },
    MultiLineString: function(object, stream) {
      var coordinates = object.coordinates, i = -1, n = coordinates.length;
      while (++i < n) streamLine(coordinates[i], stream, 0);
    },
    Polygon: function(object, stream) {
      streamPolygon(object.coordinates, stream);
    },
    MultiPolygon: function(object, stream) {
      var coordinates = object.coordinates, i = -1, n = coordinates.length;
      while (++i < n) streamPolygon(coordinates[i], stream);
    },
    GeometryCollection: function(object, stream) {
      var geometries = object.geometries, i = -1, n = geometries.length;
      while (++i < n) streamGeometry(geometries[i], stream);
    }
  };
  function streamLine(coordinates, stream, closed) {
    var i = -1, n = coordinates.length - closed, coordinate;
    stream.lineStart();
    while (++i < n) coordinate = coordinates[i], stream.point(coordinate[0], coordinate[1], coordinate[2]);
    stream.lineEnd();
  }
  function streamPolygon(coordinates, stream) {
    var i = -1, n = coordinates.length;
    stream.polygonStart();
    while (++i < n) streamLine(coordinates[i], stream, 1);
    stream.polygonEnd();
  }
  function stream_default(object, stream) {
    if (object && streamObjectType.hasOwnProperty(object.type)) {
      streamObjectType[object.type](object, stream);
    } else {
      streamGeometry(object, stream);
    }
  }

  // node_modules/d3-geo/src/cartesian.js
  function spherical(cartesian2) {
    return [atan2(cartesian2[1], cartesian2[0]), asin(cartesian2[2])];
  }
  function cartesian(spherical2) {
    var lambda = spherical2[0], phi = spherical2[1], cosPhi = cos(phi);
    return [cosPhi * cos(lambda), cosPhi * sin(lambda), sin(phi)];
  }
  function cartesianDot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }
  function cartesianCross(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  }
  function cartesianAddInPlace(a, b) {
    a[0] += b[0], a[1] += b[1], a[2] += b[2];
  }
  function cartesianScale(vector, k2) {
    return [vector[0] * k2, vector[1] * k2, vector[2] * k2];
  }
  function cartesianNormalizeInPlace(d) {
    var l = sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
    d[0] /= l, d[1] /= l, d[2] /= l;
  }

  // node_modules/d3-geo/src/compose.js
  function compose_default(a, b) {
    function compose(x, y) {
      return x = a(x, y), b(x[0], x[1]);
    }
    if (a.invert && b.invert) compose.invert = function(x, y) {
      return x = b.invert(x, y), x && a.invert(x[0], x[1]);
    };
    return compose;
  }

  // node_modules/d3-geo/src/rotation.js
  function rotationIdentity(lambda, phi) {
    if (abs(lambda) > pi) lambda -= Math.round(lambda / tau) * tau;
    return [lambda, phi];
  }
  rotationIdentity.invert = rotationIdentity;
  function rotateRadians(deltaLambda, deltaPhi, deltaGamma) {
    return (deltaLambda %= tau) ? deltaPhi || deltaGamma ? compose_default(rotationLambda(deltaLambda), rotationPhiGamma(deltaPhi, deltaGamma)) : rotationLambda(deltaLambda) : deltaPhi || deltaGamma ? rotationPhiGamma(deltaPhi, deltaGamma) : rotationIdentity;
  }
  function forwardRotationLambda(deltaLambda) {
    return function(lambda, phi) {
      lambda += deltaLambda;
      if (abs(lambda) > pi) lambda -= Math.round(lambda / tau) * tau;
      return [lambda, phi];
    };
  }
  function rotationLambda(deltaLambda) {
    var rotation = forwardRotationLambda(deltaLambda);
    rotation.invert = forwardRotationLambda(-deltaLambda);
    return rotation;
  }
  function rotationPhiGamma(deltaPhi, deltaGamma) {
    var cosDeltaPhi = cos(deltaPhi), sinDeltaPhi = sin(deltaPhi), cosDeltaGamma = cos(deltaGamma), sinDeltaGamma = sin(deltaGamma);
    function rotation(lambda, phi) {
      var cosPhi = cos(phi), x = cos(lambda) * cosPhi, y = sin(lambda) * cosPhi, z = sin(phi), k2 = z * cosDeltaPhi + x * sinDeltaPhi;
      return [
        atan2(y * cosDeltaGamma - k2 * sinDeltaGamma, x * cosDeltaPhi - z * sinDeltaPhi),
        asin(k2 * cosDeltaGamma + y * sinDeltaGamma)
      ];
    }
    rotation.invert = function(lambda, phi) {
      var cosPhi = cos(phi), x = cos(lambda) * cosPhi, y = sin(lambda) * cosPhi, z = sin(phi), k2 = z * cosDeltaGamma - y * sinDeltaGamma;
      return [
        atan2(y * cosDeltaGamma + z * sinDeltaGamma, x * cosDeltaPhi + k2 * sinDeltaPhi),
        asin(k2 * cosDeltaPhi - x * sinDeltaPhi)
      ];
    };
    return rotation;
  }

  // node_modules/d3-geo/src/circle.js
  function circleStream(stream, radius, delta, direction, t0, t1) {
    if (!delta) return;
    var cosRadius = cos(radius), sinRadius = sin(radius), step = direction * delta;
    if (t0 == null) {
      t0 = radius + direction * tau;
      t1 = radius - step / 2;
    } else {
      t0 = circleRadius(cosRadius, t0);
      t1 = circleRadius(cosRadius, t1);
      if (direction > 0 ? t0 < t1 : t0 > t1) t0 += direction * tau;
    }
    for (var point, t2 = t0; direction > 0 ? t2 > t1 : t2 < t1; t2 -= step) {
      point = spherical([cosRadius, -sinRadius * cos(t2), -sinRadius * sin(t2)]);
      stream.point(point[0], point[1]);
    }
  }
  function circleRadius(cosRadius, point) {
    point = cartesian(point), point[0] -= cosRadius;
    cartesianNormalizeInPlace(point);
    var radius = acos(-point[1]);
    return ((-point[2] < 0 ? -radius : radius) + tau - epsilon) % tau;
  }

  // node_modules/d3-geo/src/clip/buffer.js
  function buffer_default() {
    var lines = [], line;
    return {
      point: function(x, y, m) {
        line.push([x, y, m]);
      },
      lineStart: function() {
        lines.push(line = []);
      },
      lineEnd: noop,
      rejoin: function() {
        if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
      },
      result: function() {
        var result = lines;
        lines = [];
        line = null;
        return result;
      }
    };
  }

  // node_modules/d3-geo/src/pointEqual.js
  function pointEqual_default(a, b) {
    return abs(a[0] - b[0]) < epsilon && abs(a[1] - b[1]) < epsilon;
  }

  // node_modules/d3-geo/src/clip/rejoin.js
  function Intersection(point, points, other, entry) {
    this.x = point;
    this.z = points;
    this.o = other;
    this.e = entry;
    this.v = false;
    this.n = this.p = null;
  }
  function rejoin_default(segments, compareIntersection2, startInside, interpolate, stream) {
    var subject = [], clip = [], i, n;
    segments.forEach(function(segment) {
      if ((n2 = segment.length - 1) <= 0) return;
      var n2, p0 = segment[0], p1 = segment[n2], x;
      if (pointEqual_default(p0, p1)) {
        if (!p0[2] && !p1[2]) {
          stream.lineStart();
          for (i = 0; i < n2; ++i) stream.point((p0 = segment[i])[0], p0[1]);
          stream.lineEnd();
          return;
        }
        p1[0] += 2 * epsilon;
      }
      subject.push(x = new Intersection(p0, segment, null, true));
      clip.push(x.o = new Intersection(p0, null, x, false));
      subject.push(x = new Intersection(p1, segment, null, false));
      clip.push(x.o = new Intersection(p1, null, x, true));
    });
    if (!subject.length) return;
    clip.sort(compareIntersection2);
    link(subject);
    link(clip);
    for (i = 0, n = clip.length; i < n; ++i) {
      clip[i].e = startInside = !startInside;
    }
    var start2 = subject[0], points, point;
    while (1) {
      var current = start2, isSubject = true;
      while (current.v) if ((current = current.n) === start2) return;
      points = current.z;
      stream.lineStart();
      do {
        current.v = current.o.v = true;
        if (current.e) {
          if (isSubject) {
            for (i = 0, n = points.length; i < n; ++i) stream.point((point = points[i])[0], point[1]);
          } else {
            interpolate(current.x, current.n.x, 1, stream);
          }
          current = current.n;
        } else {
          if (isSubject) {
            points = current.p.z;
            for (i = points.length - 1; i >= 0; --i) stream.point((point = points[i])[0], point[1]);
          } else {
            interpolate(current.x, current.p.x, -1, stream);
          }
          current = current.p;
        }
        current = current.o;
        points = current.z;
        isSubject = !isSubject;
      } while (!current.v);
      stream.lineEnd();
    }
  }
  function link(array2) {
    if (!(n = array2.length)) return;
    var n, i = 0, a = array2[0], b;
    while (++i < n) {
      a.n = b = array2[i];
      b.p = a;
      a = b;
    }
    a.n = b = array2[0];
    b.p = a;
  }

  // node_modules/d3-geo/src/polygonContains.js
  function longitude(point) {
    return abs(point[0]) <= pi ? point[0] : sign(point[0]) * ((abs(point[0]) + pi) % tau - pi);
  }
  function polygonContains_default(polygon, point) {
    var lambda = longitude(point), phi = point[1], sinPhi = sin(phi), normal = [sin(lambda), -cos(lambda), 0], angle = 0, winding = 0;
    var sum = new Adder();
    if (sinPhi === 1) phi = halfPi + epsilon;
    else if (sinPhi === -1) phi = -halfPi - epsilon;
    for (var i = 0, n = polygon.length; i < n; ++i) {
      if (!(m = (ring = polygon[i]).length)) continue;
      var ring, m, point0 = ring[m - 1], lambda0 = longitude(point0), phi0 = point0[1] / 2 + quarterPi, sinPhi0 = sin(phi0), cosPhi0 = cos(phi0);
      for (var j = 0; j < m; ++j, lambda0 = lambda1, sinPhi0 = sinPhi1, cosPhi0 = cosPhi1, point0 = point1) {
        var point1 = ring[j], lambda1 = longitude(point1), phi1 = point1[1] / 2 + quarterPi, sinPhi1 = sin(phi1), cosPhi1 = cos(phi1), delta = lambda1 - lambda0, sign2 = delta >= 0 ? 1 : -1, absDelta = sign2 * delta, antimeridian = absDelta > pi, k2 = sinPhi0 * sinPhi1;
        sum.add(atan2(k2 * sign2 * sin(absDelta), cosPhi0 * cosPhi1 + k2 * cos(absDelta)));
        angle += antimeridian ? delta + sign2 * tau : delta;
        if (antimeridian ^ lambda0 >= lambda ^ lambda1 >= lambda) {
          var arc = cartesianCross(cartesian(point0), cartesian(point1));
          cartesianNormalizeInPlace(arc);
          var intersection = cartesianCross(normal, arc);
          cartesianNormalizeInPlace(intersection);
          var phiArc = (antimeridian ^ delta >= 0 ? -1 : 1) * asin(intersection[2]);
          if (phi > phiArc || phi === phiArc && (arc[0] || arc[1])) {
            winding += antimeridian ^ delta >= 0 ? 1 : -1;
          }
        }
      }
    }
    return (angle < -epsilon || angle < epsilon && sum < -epsilon2) ^ winding & 1;
  }

  // node_modules/d3-geo/src/clip/index.js
  function clip_default(pointVisible, clipLine, interpolate, start2) {
    return function(sink) {
      var line = clipLine(sink), ringBuffer = buffer_default(), ringSink = clipLine(ringBuffer), polygonStarted = false, polygon, segments, ring;
      var clip = {
        point,
        lineStart,
        lineEnd,
        polygonStart: function() {
          clip.point = pointRing;
          clip.lineStart = ringStart;
          clip.lineEnd = ringEnd;
          segments = [];
          polygon = [];
        },
        polygonEnd: function() {
          clip.point = point;
          clip.lineStart = lineStart;
          clip.lineEnd = lineEnd;
          segments = merge(segments);
          var startInside = polygonContains_default(polygon, start2);
          if (segments.length) {
            if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
            rejoin_default(segments, compareIntersection, startInside, interpolate, sink);
          } else if (startInside) {
            if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
            sink.lineStart();
            interpolate(null, null, 1, sink);
            sink.lineEnd();
          }
          if (polygonStarted) sink.polygonEnd(), polygonStarted = false;
          segments = polygon = null;
        },
        sphere: function() {
          sink.polygonStart();
          sink.lineStart();
          interpolate(null, null, 1, sink);
          sink.lineEnd();
          sink.polygonEnd();
        }
      };
      function point(lambda, phi) {
        if (pointVisible(lambda, phi)) sink.point(lambda, phi);
      }
      function pointLine(lambda, phi) {
        line.point(lambda, phi);
      }
      function lineStart() {
        clip.point = pointLine;
        line.lineStart();
      }
      function lineEnd() {
        clip.point = point;
        line.lineEnd();
      }
      function pointRing(lambda, phi) {
        ring.push([lambda, phi]);
        ringSink.point(lambda, phi);
      }
      function ringStart() {
        ringSink.lineStart();
        ring = [];
      }
      function ringEnd() {
        pointRing(ring[0][0], ring[0][1]);
        ringSink.lineEnd();
        var clean = ringSink.clean(), ringSegments = ringBuffer.result(), i, n = ringSegments.length, m, segment, point2;
        ring.pop();
        polygon.push(ring);
        ring = null;
        if (!n) return;
        if (clean & 1) {
          segment = ringSegments[0];
          if ((m = segment.length - 1) > 0) {
            if (!polygonStarted) sink.polygonStart(), polygonStarted = true;
            sink.lineStart();
            for (i = 0; i < m; ++i) sink.point((point2 = segment[i])[0], point2[1]);
            sink.lineEnd();
          }
          return;
        }
        if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));
        segments.push(ringSegments.filter(validSegment));
      }
      return clip;
    };
  }
  function validSegment(segment) {
    return segment.length > 1;
  }
  function compareIntersection(a, b) {
    return ((a = a.x)[0] < 0 ? a[1] - halfPi - epsilon : halfPi - a[1]) - ((b = b.x)[0] < 0 ? b[1] - halfPi - epsilon : halfPi - b[1]);
  }

  // node_modules/d3-geo/src/clip/antimeridian.js
  var antimeridian_default = clip_default(
    function() {
      return true;
    },
    clipAntimeridianLine,
    clipAntimeridianInterpolate,
    [-pi, -halfPi]
  );
  function clipAntimeridianLine(stream) {
    var lambda0 = NaN, phi0 = NaN, sign0 = NaN, clean;
    return {
      lineStart: function() {
        stream.lineStart();
        clean = 1;
      },
      point: function(lambda1, phi1) {
        var sign1 = lambda1 > 0 ? pi : -pi, delta = abs(lambda1 - lambda0);
        if (abs(delta - pi) < epsilon) {
          stream.point(lambda0, phi0 = (phi0 + phi1) / 2 > 0 ? halfPi : -halfPi);
          stream.point(sign0, phi0);
          stream.lineEnd();
          stream.lineStart();
          stream.point(sign1, phi0);
          stream.point(lambda1, phi0);
          clean = 0;
        } else if (sign0 !== sign1 && delta >= pi) {
          if (abs(lambda0 - sign0) < epsilon) lambda0 -= sign0 * epsilon;
          if (abs(lambda1 - sign1) < epsilon) lambda1 -= sign1 * epsilon;
          phi0 = clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1);
          stream.point(sign0, phi0);
          stream.lineEnd();
          stream.lineStart();
          stream.point(sign1, phi0);
          clean = 0;
        }
        stream.point(lambda0 = lambda1, phi0 = phi1);
        sign0 = sign1;
      },
      lineEnd: function() {
        stream.lineEnd();
        lambda0 = phi0 = NaN;
      },
      clean: function() {
        return 2 - clean;
      }
    };
  }
  function clipAntimeridianIntersect(lambda0, phi0, lambda1, phi1) {
    var cosPhi0, cosPhi1, sinLambda0Lambda1 = sin(lambda0 - lambda1);
    return abs(sinLambda0Lambda1) > epsilon ? atan((sin(phi0) * (cosPhi1 = cos(phi1)) * sin(lambda1) - sin(phi1) * (cosPhi0 = cos(phi0)) * sin(lambda0)) / (cosPhi0 * cosPhi1 * sinLambda0Lambda1)) : (phi0 + phi1) / 2;
  }
  function clipAntimeridianInterpolate(from, to, direction, stream) {
    var phi;
    if (from == null) {
      phi = direction * halfPi;
      stream.point(-pi, phi);
      stream.point(0, phi);
      stream.point(pi, phi);
      stream.point(pi, 0);
      stream.point(pi, -phi);
      stream.point(0, -phi);
      stream.point(-pi, -phi);
      stream.point(-pi, 0);
      stream.point(-pi, phi);
    } else if (abs(from[0] - to[0]) > epsilon) {
      var lambda = from[0] < to[0] ? pi : -pi;
      phi = direction * lambda / 2;
      stream.point(-lambda, phi);
      stream.point(0, phi);
      stream.point(lambda, phi);
    } else {
      stream.point(to[0], to[1]);
    }
  }

  // node_modules/d3-geo/src/clip/circle.js
  function circle_default(radius) {
    var cr = cos(radius), delta = 2 * radians, smallRadius = cr > 0, notHemisphere = abs(cr) > epsilon;
    function interpolate(from, to, direction, stream) {
      circleStream(stream, radius, delta, direction, from, to);
    }
    function visible(lambda, phi) {
      return cos(lambda) * cos(phi) > cr;
    }
    function clipLine(stream) {
      var point0, c0, v0, v00, clean;
      return {
        lineStart: function() {
          v00 = v0 = false;
          clean = 1;
        },
        point: function(lambda, phi) {
          var point1 = [lambda, phi], point2, v = visible(lambda, phi), c = smallRadius ? v ? 0 : code(lambda, phi) : v ? code(lambda + (lambda < 0 ? pi : -pi), phi) : 0;
          if (!point0 && (v00 = v0 = v)) stream.lineStart();
          if (v !== v0) {
            point2 = intersect(point0, point1);
            if (!point2 || pointEqual_default(point0, point2) || pointEqual_default(point1, point2))
              point1[2] = 1;
          }
          if (v !== v0) {
            clean = 0;
            if (v) {
              stream.lineStart();
              point2 = intersect(point1, point0);
              stream.point(point2[0], point2[1]);
            } else {
              point2 = intersect(point0, point1);
              stream.point(point2[0], point2[1], 2);
              stream.lineEnd();
            }
            point0 = point2;
          } else if (notHemisphere && point0 && smallRadius ^ v) {
            var t2;
            if (!(c & c0) && (t2 = intersect(point1, point0, true))) {
              clean = 0;
              if (smallRadius) {
                stream.lineStart();
                stream.point(t2[0][0], t2[0][1]);
                stream.point(t2[1][0], t2[1][1]);
                stream.lineEnd();
              } else {
                stream.point(t2[1][0], t2[1][1]);
                stream.lineEnd();
                stream.lineStart();
                stream.point(t2[0][0], t2[0][1], 3);
              }
            }
          }
          if (v && (!point0 || !pointEqual_default(point0, point1))) {
            stream.point(point1[0], point1[1]);
          }
          point0 = point1, v0 = v, c0 = c;
        },
        lineEnd: function() {
          if (v0) stream.lineEnd();
          point0 = null;
        },
        // Rejoin first and last segments if there were intersections and the first
        // and last points were visible.
        clean: function() {
          return clean | (v00 && v0) << 1;
        }
      };
    }
    function intersect(a, b, two) {
      var pa = cartesian(a), pb = cartesian(b);
      var n1 = [1, 0, 0], n2 = cartesianCross(pa, pb), n2n2 = cartesianDot(n2, n2), n1n2 = n2[0], determinant = n2n2 - n1n2 * n1n2;
      if (!determinant) return !two && a;
      var c1 = cr * n2n2 / determinant, c2 = -cr * n1n2 / determinant, n1xn2 = cartesianCross(n1, n2), A = cartesianScale(n1, c1), B = cartesianScale(n2, c2);
      cartesianAddInPlace(A, B);
      var u = n1xn2, w = cartesianDot(A, u), uu = cartesianDot(u, u), t2 = w * w - uu * (cartesianDot(A, A) - 1);
      if (t2 < 0) return;
      var t3 = sqrt(t2), q = cartesianScale(u, (-w - t3) / uu);
      cartesianAddInPlace(q, A);
      q = spherical(q);
      if (!two) return q;
      var lambda0 = a[0], lambda1 = b[0], phi0 = a[1], phi1 = b[1], z;
      if (lambda1 < lambda0) z = lambda0, lambda0 = lambda1, lambda1 = z;
      var delta2 = lambda1 - lambda0, polar = abs(delta2 - pi) < epsilon, meridian = polar || delta2 < epsilon;
      if (!polar && phi1 < phi0) z = phi0, phi0 = phi1, phi1 = z;
      if (meridian ? polar ? phi0 + phi1 > 0 ^ q[1] < (abs(q[0] - lambda0) < epsilon ? phi0 : phi1) : phi0 <= q[1] && q[1] <= phi1 : delta2 > pi ^ (lambda0 <= q[0] && q[0] <= lambda1)) {
        var q1 = cartesianScale(u, (-w + t3) / uu);
        cartesianAddInPlace(q1, A);
        return [q, spherical(q1)];
      }
    }
    function code(lambda, phi) {
      var r = smallRadius ? radius : pi - radius, code2 = 0;
      if (lambda < -r) code2 |= 1;
      else if (lambda > r) code2 |= 2;
      if (phi < -r) code2 |= 4;
      else if (phi > r) code2 |= 8;
      return code2;
    }
    return clip_default(visible, clipLine, interpolate, smallRadius ? [0, -radius] : [-pi, radius - pi]);
  }

  // node_modules/d3-geo/src/clip/line.js
  function line_default(a, b, x05, y05, x12, y12) {
    var ax = a[0], ay = a[1], bx = b[0], by = b[1], t0 = 0, t1 = 1, dx = bx - ax, dy = by - ay, r;
    r = x05 - ax;
    if (!dx && r > 0) return;
    r /= dx;
    if (dx < 0) {
      if (r < t0) return;
      if (r < t1) t1 = r;
    } else if (dx > 0) {
      if (r > t1) return;
      if (r > t0) t0 = r;
    }
    r = x12 - ax;
    if (!dx && r < 0) return;
    r /= dx;
    if (dx < 0) {
      if (r > t1) return;
      if (r > t0) t0 = r;
    } else if (dx > 0) {
      if (r < t0) return;
      if (r < t1) t1 = r;
    }
    r = y05 - ay;
    if (!dy && r > 0) return;
    r /= dy;
    if (dy < 0) {
      if (r < t0) return;
      if (r < t1) t1 = r;
    } else if (dy > 0) {
      if (r > t1) return;
      if (r > t0) t0 = r;
    }
    r = y12 - ay;
    if (!dy && r < 0) return;
    r /= dy;
    if (dy < 0) {
      if (r > t1) return;
      if (r > t0) t0 = r;
    } else if (dy > 0) {
      if (r < t0) return;
      if (r < t1) t1 = r;
    }
    if (t0 > 0) a[0] = ax + t0 * dx, a[1] = ay + t0 * dy;
    if (t1 < 1) b[0] = ax + t1 * dx, b[1] = ay + t1 * dy;
    return true;
  }

  // node_modules/d3-geo/src/clip/rectangle.js
  var clipMax = 1e9;
  var clipMin = -clipMax;
  function clipRectangle(x05, y05, x12, y12) {
    function visible(x, y) {
      return x05 <= x && x <= x12 && y05 <= y && y <= y12;
    }
    function interpolate(from, to, direction, stream) {
      var a = 0, a1 = 0;
      if (from == null || (a = corner(from, direction)) !== (a1 = corner(to, direction)) || comparePoint(from, to) < 0 ^ direction > 0) {
        do
          stream.point(a === 0 || a === 3 ? x05 : x12, a > 1 ? y12 : y05);
        while ((a = (a + direction + 4) % 4) !== a1);
      } else {
        stream.point(to[0], to[1]);
      }
    }
    function corner(p, direction) {
      return abs(p[0] - x05) < epsilon ? direction > 0 ? 0 : 3 : abs(p[0] - x12) < epsilon ? direction > 0 ? 2 : 1 : abs(p[1] - y05) < epsilon ? direction > 0 ? 1 : 0 : direction > 0 ? 3 : 2;
    }
    function compareIntersection2(a, b) {
      return comparePoint(a.x, b.x);
    }
    function comparePoint(a, b) {
      var ca = corner(a, 1), cb = corner(b, 1);
      return ca !== cb ? ca - cb : ca === 0 ? b[1] - a[1] : ca === 1 ? a[0] - b[0] : ca === 2 ? a[1] - b[1] : b[0] - a[0];
    }
    return function(stream) {
      var activeStream = stream, bufferStream = buffer_default(), segments, polygon, ring, x__, y__, v__, x_, y_, v_, first, clean;
      var clipStream = {
        point,
        lineStart,
        lineEnd,
        polygonStart,
        polygonEnd
      };
      function point(x, y) {
        if (visible(x, y)) activeStream.point(x, y);
      }
      function polygonInside() {
        var winding = 0;
        for (var i = 0, n = polygon.length; i < n; ++i) {
          for (var ring2 = polygon[i], j = 1, m = ring2.length, point2 = ring2[0], a0, a1, b0 = point2[0], b1 = point2[1]; j < m; ++j) {
            a0 = b0, a1 = b1, point2 = ring2[j], b0 = point2[0], b1 = point2[1];
            if (a1 <= y12) {
              if (b1 > y12 && (b0 - a0) * (y12 - a1) > (b1 - a1) * (x05 - a0)) ++winding;
            } else {
              if (b1 <= y12 && (b0 - a0) * (y12 - a1) < (b1 - a1) * (x05 - a0)) --winding;
            }
          }
        }
        return winding;
      }
      function polygonStart() {
        activeStream = bufferStream, segments = [], polygon = [], clean = true;
      }
      function polygonEnd() {
        var startInside = polygonInside(), cleanInside = clean && startInside, visible2 = (segments = merge(segments)).length;
        if (cleanInside || visible2) {
          stream.polygonStart();
          if (cleanInside) {
            stream.lineStart();
            interpolate(null, null, 1, stream);
            stream.lineEnd();
          }
          if (visible2) {
            rejoin_default(segments, compareIntersection2, startInside, interpolate, stream);
          }
          stream.polygonEnd();
        }
        activeStream = stream, segments = polygon = ring = null;
      }
      function lineStart() {
        clipStream.point = linePoint;
        if (polygon) polygon.push(ring = []);
        first = true;
        v_ = false;
        x_ = y_ = NaN;
      }
      function lineEnd() {
        if (segments) {
          linePoint(x__, y__);
          if (v__ && v_) bufferStream.rejoin();
          segments.push(bufferStream.result());
        }
        clipStream.point = point;
        if (v_) activeStream.lineEnd();
      }
      function linePoint(x, y) {
        var v = visible(x, y);
        if (polygon) ring.push([x, y]);
        if (first) {
          x__ = x, y__ = y, v__ = v;
          first = false;
          if (v) {
            activeStream.lineStart();
            activeStream.point(x, y);
          }
        } else {
          if (v && v_) activeStream.point(x, y);
          else {
            var a = [x_ = Math.max(clipMin, Math.min(clipMax, x_)), y_ = Math.max(clipMin, Math.min(clipMax, y_))], b = [x = Math.max(clipMin, Math.min(clipMax, x)), y = Math.max(clipMin, Math.min(clipMax, y))];
            if (line_default(a, b, x05, y05, x12, y12)) {
              if (!v_) {
                activeStream.lineStart();
                activeStream.point(a[0], a[1]);
              }
              activeStream.point(b[0], b[1]);
              if (!v) activeStream.lineEnd();
              clean = false;
            } else if (v) {
              activeStream.lineStart();
              activeStream.point(x, y);
              clean = false;
            }
          }
        }
        x_ = x, y_ = y, v_ = v;
      }
      return clipStream;
    };
  }

  // node_modules/d3-geo/src/graticule.js
  function graticuleX(y05, y12, dy) {
    var y = range(y05, y12 - epsilon, dy).concat(y12);
    return function(x) {
      return y.map(function(y2) {
        return [x, y2];
      });
    };
  }
  function graticuleY(x05, x12, dx) {
    var x = range(x05, x12 - epsilon, dx).concat(x12);
    return function(y) {
      return x.map(function(x2) {
        return [x2, y];
      });
    };
  }
  function graticule() {
    var x12, x05, X12, X02, y12, y05, Y12, Y02, dx = 10, dy = dx, DX = 90, DY = 360, x, y, X, Y, precision = 2.5;
    function graticule2() {
      return { type: "MultiLineString", coordinates: lines() };
    }
    function lines() {
      return range(ceil(X02 / DX) * DX, X12, DX).map(X).concat(range(ceil(Y02 / DY) * DY, Y12, DY).map(Y)).concat(range(ceil(x05 / dx) * dx, x12, dx).filter(function(x2) {
        return abs(x2 % DX) > epsilon;
      }).map(x)).concat(range(ceil(y05 / dy) * dy, y12, dy).filter(function(y2) {
        return abs(y2 % DY) > epsilon;
      }).map(y));
    }
    graticule2.lines = function() {
      return lines().map(function(coordinates) {
        return { type: "LineString", coordinates };
      });
    };
    graticule2.outline = function() {
      return {
        type: "Polygon",
        coordinates: [
          X(X02).concat(
            Y(Y12).slice(1),
            X(X12).reverse().slice(1),
            Y(Y02).reverse().slice(1)
          )
        ]
      };
    };
    graticule2.extent = function(_) {
      if (!arguments.length) return graticule2.extentMinor();
      return graticule2.extentMajor(_).extentMinor(_);
    };
    graticule2.extentMajor = function(_) {
      if (!arguments.length) return [[X02, Y02], [X12, Y12]];
      X02 = +_[0][0], X12 = +_[1][0];
      Y02 = +_[0][1], Y12 = +_[1][1];
      if (X02 > X12) _ = X02, X02 = X12, X12 = _;
      if (Y02 > Y12) _ = Y02, Y02 = Y12, Y12 = _;
      return graticule2.precision(precision);
    };
    graticule2.extentMinor = function(_) {
      if (!arguments.length) return [[x05, y05], [x12, y12]];
      x05 = +_[0][0], x12 = +_[1][0];
      y05 = +_[0][1], y12 = +_[1][1];
      if (x05 > x12) _ = x05, x05 = x12, x12 = _;
      if (y05 > y12) _ = y05, y05 = y12, y12 = _;
      return graticule2.precision(precision);
    };
    graticule2.step = function(_) {
      if (!arguments.length) return graticule2.stepMinor();
      return graticule2.stepMajor(_).stepMinor(_);
    };
    graticule2.stepMajor = function(_) {
      if (!arguments.length) return [DX, DY];
      DX = +_[0], DY = +_[1];
      return graticule2;
    };
    graticule2.stepMinor = function(_) {
      if (!arguments.length) return [dx, dy];
      dx = +_[0], dy = +_[1];
      return graticule2;
    };
    graticule2.precision = function(_) {
      if (!arguments.length) return precision;
      precision = +_;
      x = graticuleX(y05, y12, 90);
      y = graticuleY(x05, x12, precision);
      X = graticuleX(Y02, Y12, 90);
      Y = graticuleY(X02, X12, precision);
      return graticule2;
    };
    return graticule2.extentMajor([[-180, -90 + epsilon], [180, 90 - epsilon]]).extentMinor([[-180, -80 - epsilon], [180, 80 + epsilon]]);
  }
  function graticule10() {
    return graticule()();
  }

  // node_modules/d3-geo/src/identity.js
  var identity_default = (x) => x;

  // node_modules/d3-geo/src/path/area.js
  var areaSum = new Adder();
  var areaRingSum = new Adder();
  var x00;
  var y00;
  var x0;
  var y0;
  var areaStream = {
    point: noop,
    lineStart: noop,
    lineEnd: noop,
    polygonStart: function() {
      areaStream.lineStart = areaRingStart;
      areaStream.lineEnd = areaRingEnd;
    },
    polygonEnd: function() {
      areaStream.lineStart = areaStream.lineEnd = areaStream.point = noop;
      areaSum.add(abs(areaRingSum));
      areaRingSum = new Adder();
    },
    result: function() {
      var area = areaSum / 2;
      areaSum = new Adder();
      return area;
    }
  };
  function areaRingStart() {
    areaStream.point = areaPointFirst;
  }
  function areaPointFirst(x, y) {
    areaStream.point = areaPoint;
    x00 = x0 = x, y00 = y0 = y;
  }
  function areaPoint(x, y) {
    areaRingSum.add(y0 * x - x0 * y);
    x0 = x, y0 = y;
  }
  function areaRingEnd() {
    areaPoint(x00, y00);
  }
  var area_default = areaStream;

  // node_modules/d3-geo/src/path/bounds.js
  var x02 = Infinity;
  var y02 = x02;
  var x1 = -x02;
  var y1 = x1;
  var boundsStream = {
    point: boundsPoint,
    lineStart: noop,
    lineEnd: noop,
    polygonStart: noop,
    polygonEnd: noop,
    result: function() {
      var bounds = [[x02, y02], [x1, y1]];
      x1 = y1 = -(y02 = x02 = Infinity);
      return bounds;
    }
  };
  function boundsPoint(x, y) {
    if (x < x02) x02 = x;
    if (x > x1) x1 = x;
    if (y < y02) y02 = y;
    if (y > y1) y1 = y;
  }
  var bounds_default = boundsStream;

  // node_modules/d3-geo/src/path/centroid.js
  var X0 = 0;
  var Y0 = 0;
  var Z0 = 0;
  var X1 = 0;
  var Y1 = 0;
  var Z1 = 0;
  var X2 = 0;
  var Y2 = 0;
  var Z2 = 0;
  var x002;
  var y002;
  var x03;
  var y03;
  var centroidStream = {
    point: centroidPoint,
    lineStart: centroidLineStart,
    lineEnd: centroidLineEnd,
    polygonStart: function() {
      centroidStream.lineStart = centroidRingStart;
      centroidStream.lineEnd = centroidRingEnd;
    },
    polygonEnd: function() {
      centroidStream.point = centroidPoint;
      centroidStream.lineStart = centroidLineStart;
      centroidStream.lineEnd = centroidLineEnd;
    },
    result: function() {
      var centroid = Z2 ? [X2 / Z2, Y2 / Z2] : Z1 ? [X1 / Z1, Y1 / Z1] : Z0 ? [X0 / Z0, Y0 / Z0] : [NaN, NaN];
      X0 = Y0 = Z0 = X1 = Y1 = Z1 = X2 = Y2 = Z2 = 0;
      return centroid;
    }
  };
  function centroidPoint(x, y) {
    X0 += x;
    Y0 += y;
    ++Z0;
  }
  function centroidLineStart() {
    centroidStream.point = centroidPointFirstLine;
  }
  function centroidPointFirstLine(x, y) {
    centroidStream.point = centroidPointLine;
    centroidPoint(x03 = x, y03 = y);
  }
  function centroidPointLine(x, y) {
    var dx = x - x03, dy = y - y03, z = sqrt(dx * dx + dy * dy);
    X1 += z * (x03 + x) / 2;
    Y1 += z * (y03 + y) / 2;
    Z1 += z;
    centroidPoint(x03 = x, y03 = y);
  }
  function centroidLineEnd() {
    centroidStream.point = centroidPoint;
  }
  function centroidRingStart() {
    centroidStream.point = centroidPointFirstRing;
  }
  function centroidRingEnd() {
    centroidPointRing(x002, y002);
  }
  function centroidPointFirstRing(x, y) {
    centroidStream.point = centroidPointRing;
    centroidPoint(x002 = x03 = x, y002 = y03 = y);
  }
  function centroidPointRing(x, y) {
    var dx = x - x03, dy = y - y03, z = sqrt(dx * dx + dy * dy);
    X1 += z * (x03 + x) / 2;
    Y1 += z * (y03 + y) / 2;
    Z1 += z;
    z = y03 * x - x03 * y;
    X2 += z * (x03 + x);
    Y2 += z * (y03 + y);
    Z2 += z * 3;
    centroidPoint(x03 = x, y03 = y);
  }
  var centroid_default = centroidStream;

  // node_modules/d3-geo/src/path/context.js
  function PathContext(context) {
    this._context = context;
  }
  PathContext.prototype = {
    _radius: 4.5,
    pointRadius: function(_) {
      return this._radius = _, this;
    },
    polygonStart: function() {
      this._line = 0;
    },
    polygonEnd: function() {
      this._line = NaN;
    },
    lineStart: function() {
      this._point = 0;
    },
    lineEnd: function() {
      if (this._line === 0) this._context.closePath();
      this._point = NaN;
    },
    point: function(x, y) {
      switch (this._point) {
        case 0: {
          this._context.moveTo(x, y);
          this._point = 1;
          break;
        }
        case 1: {
          this._context.lineTo(x, y);
          break;
        }
        default: {
          this._context.moveTo(x + this._radius, y);
          this._context.arc(x, y, this._radius, 0, tau);
          break;
        }
      }
    },
    result: noop
  };

  // node_modules/d3-geo/src/path/measure.js
  var lengthSum = new Adder();
  var lengthRing;
  var x003;
  var y003;
  var x04;
  var y04;
  var lengthStream = {
    point: noop,
    lineStart: function() {
      lengthStream.point = lengthPointFirst;
    },
    lineEnd: function() {
      if (lengthRing) lengthPoint(x003, y003);
      lengthStream.point = noop;
    },
    polygonStart: function() {
      lengthRing = true;
    },
    polygonEnd: function() {
      lengthRing = null;
    },
    result: function() {
      var length = +lengthSum;
      lengthSum = new Adder();
      return length;
    }
  };
  function lengthPointFirst(x, y) {
    lengthStream.point = lengthPoint;
    x003 = x04 = x, y003 = y04 = y;
  }
  function lengthPoint(x, y) {
    x04 -= x, y04 -= y;
    lengthSum.add(sqrt(x04 * x04 + y04 * y04));
    x04 = x, y04 = y;
  }
  var measure_default = lengthStream;

  // node_modules/d3-geo/src/path/string.js
  var cacheDigits;
  var cacheAppend;
  var cacheRadius;
  var cacheCircle;
  var PathString = class {
    constructor(digits) {
      this._append = digits == null ? append : appendRound(digits);
      this._radius = 4.5;
      this._ = "";
    }
    pointRadius(_) {
      this._radius = +_;
      return this;
    }
    polygonStart() {
      this._line = 0;
    }
    polygonEnd() {
      this._line = NaN;
    }
    lineStart() {
      this._point = 0;
    }
    lineEnd() {
      if (this._line === 0) this._ += "Z";
      this._point = NaN;
    }
    point(x, y) {
      switch (this._point) {
        case 0: {
          this._append`M${x},${y}`;
          this._point = 1;
          break;
        }
        case 1: {
          this._append`L${x},${y}`;
          break;
        }
        default: {
          this._append`M${x},${y}`;
          if (this._radius !== cacheRadius || this._append !== cacheAppend) {
            const r = this._radius;
            const s = this._;
            this._ = "";
            this._append`m0,${r}a${r},${r} 0 1,1 0,${-2 * r}a${r},${r} 0 1,1 0,${2 * r}z`;
            cacheRadius = r;
            cacheAppend = this._append;
            cacheCircle = this._;
            this._ = s;
          }
          this._ += cacheCircle;
          break;
        }
      }
    }
    result() {
      const result = this._;
      this._ = "";
      return result.length ? result : null;
    }
  };
  function append(strings) {
    let i = 1;
    this._ += strings[0];
    for (const j = strings.length; i < j; ++i) {
      this._ += arguments[i] + strings[i];
    }
  }
  function appendRound(digits) {
    const d = Math.floor(digits);
    if (!(d >= 0)) throw new RangeError(`invalid digits: ${digits}`);
    if (d > 15) return append;
    if (d !== cacheDigits) {
      const k2 = 10 ** d;
      cacheDigits = d;
      cacheAppend = function append2(strings) {
        let i = 1;
        this._ += strings[0];
        for (const j = strings.length; i < j; ++i) {
          this._ += Math.round(arguments[i] * k2) / k2 + strings[i];
        }
      };
    }
    return cacheAppend;
  }

  // node_modules/d3-geo/src/path/index.js
  function path_default(projection3, context) {
    let digits = 3, pointRadius = 4.5, projectionStream, contextStream;
    function path2(object) {
      if (object) {
        if (typeof pointRadius === "function") contextStream.pointRadius(+pointRadius.apply(this, arguments));
        stream_default(object, projectionStream(contextStream));
      }
      return contextStream.result();
    }
    path2.area = function(object) {
      stream_default(object, projectionStream(area_default));
      return area_default.result();
    };
    path2.measure = function(object) {
      stream_default(object, projectionStream(measure_default));
      return measure_default.result();
    };
    path2.bounds = function(object) {
      stream_default(object, projectionStream(bounds_default));
      return bounds_default.result();
    };
    path2.centroid = function(object) {
      stream_default(object, projectionStream(centroid_default));
      return centroid_default.result();
    };
    path2.projection = function(_) {
      if (!arguments.length) return projection3;
      projectionStream = _ == null ? (projection3 = null, identity_default) : (projection3 = _).stream;
      return path2;
    };
    path2.context = function(_) {
      if (!arguments.length) return context;
      contextStream = _ == null ? (context = null, new PathString(digits)) : new PathContext(context = _);
      if (typeof pointRadius !== "function") contextStream.pointRadius(pointRadius);
      return path2;
    };
    path2.pointRadius = function(_) {
      if (!arguments.length) return pointRadius;
      pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
      return path2;
    };
    path2.digits = function(_) {
      if (!arguments.length) return digits;
      if (_ == null) digits = null;
      else {
        const d = Math.floor(_);
        if (!(d >= 0)) throw new RangeError(`invalid digits: ${_}`);
        digits = d;
      }
      if (context === null) contextStream = new PathString(digits);
      return path2;
    };
    return path2.projection(projection3).digits(digits).context(context);
  }

  // node_modules/d3-geo/src/transform.js
  function transformer(methods) {
    return function(stream) {
      var s = new TransformStream();
      for (var key in methods) s[key] = methods[key];
      s.stream = stream;
      return s;
    };
  }
  function TransformStream() {
  }
  TransformStream.prototype = {
    constructor: TransformStream,
    point: function(x, y) {
      this.stream.point(x, y);
    },
    sphere: function() {
      this.stream.sphere();
    },
    lineStart: function() {
      this.stream.lineStart();
    },
    lineEnd: function() {
      this.stream.lineEnd();
    },
    polygonStart: function() {
      this.stream.polygonStart();
    },
    polygonEnd: function() {
      this.stream.polygonEnd();
    }
  };

  // node_modules/d3-geo/src/projection/fit.js
  function fit(projection3, fitBounds, object) {
    var clip = projection3.clipExtent && projection3.clipExtent();
    projection3.scale(150).translate([0, 0]);
    if (clip != null) projection3.clipExtent(null);
    stream_default(object, projection3.stream(bounds_default));
    fitBounds(bounds_default.result());
    if (clip != null) projection3.clipExtent(clip);
    return projection3;
  }
  function fitExtent(projection3, extent, object) {
    return fit(projection3, function(b) {
      var w = extent[1][0] - extent[0][0], h = extent[1][1] - extent[0][1], k2 = Math.min(w / (b[1][0] - b[0][0]), h / (b[1][1] - b[0][1])), x = +extent[0][0] + (w - k2 * (b[1][0] + b[0][0])) / 2, y = +extent[0][1] + (h - k2 * (b[1][1] + b[0][1])) / 2;
      projection3.scale(150 * k2).translate([x, y]);
    }, object);
  }
  function fitSize(projection3, size, object) {
    return fitExtent(projection3, [[0, 0], size], object);
  }
  function fitWidth(projection3, width, object) {
    return fit(projection3, function(b) {
      var w = +width, k2 = w / (b[1][0] - b[0][0]), x = (w - k2 * (b[1][0] + b[0][0])) / 2, y = -k2 * b[0][1];
      projection3.scale(150 * k2).translate([x, y]);
    }, object);
  }
  function fitHeight(projection3, height, object) {
    return fit(projection3, function(b) {
      var h = +height, k2 = h / (b[1][1] - b[0][1]), x = -k2 * b[0][0], y = (h - k2 * (b[1][1] + b[0][1])) / 2;
      projection3.scale(150 * k2).translate([x, y]);
    }, object);
  }

  // node_modules/d3-geo/src/projection/resample.js
  var maxDepth = 16;
  var cosMinDistance = cos(30 * radians);
  function resample_default(project, delta2) {
    return +delta2 ? resample(project, delta2) : resampleNone(project);
  }
  function resampleNone(project) {
    return transformer({
      point: function(x, y) {
        x = project(x, y);
        this.stream.point(x[0], x[1]);
      }
    });
  }
  function resample(project, delta2) {
    function resampleLineTo(x05, y05, lambda0, a0, b0, c0, x12, y12, lambda1, a1, b1, c1, depth, stream) {
      var dx = x12 - x05, dy = y12 - y05, d2 = dx * dx + dy * dy;
      if (d2 > 4 * delta2 && depth--) {
        var a = a0 + a1, b = b0 + b1, c = c0 + c1, m = sqrt(a * a + b * b + c * c), phi2 = asin(c /= m), lambda2 = abs(abs(c) - 1) < epsilon || abs(lambda0 - lambda1) < epsilon ? (lambda0 + lambda1) / 2 : atan2(b, a), p = project(lambda2, phi2), x2 = p[0], y2 = p[1], dx2 = x2 - x05, dy2 = y2 - y05, dz = dy * dx2 - dx * dy2;
        if (dz * dz / d2 > delta2 || abs((dx * dx2 + dy * dy2) / d2 - 0.5) > 0.3 || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) {
          resampleLineTo(x05, y05, lambda0, a0, b0, c0, x2, y2, lambda2, a /= m, b /= m, c, depth, stream);
          stream.point(x2, y2);
          resampleLineTo(x2, y2, lambda2, a, b, c, x12, y12, lambda1, a1, b1, c1, depth, stream);
        }
      }
    }
    return function(stream) {
      var lambda00, x004, y004, a00, b00, c00, lambda0, x05, y05, a0, b0, c0;
      var resampleStream = {
        point,
        lineStart,
        lineEnd,
        polygonStart: function() {
          stream.polygonStart();
          resampleStream.lineStart = ringStart;
        },
        polygonEnd: function() {
          stream.polygonEnd();
          resampleStream.lineStart = lineStart;
        }
      };
      function point(x, y) {
        x = project(x, y);
        stream.point(x[0], x[1]);
      }
      function lineStart() {
        x05 = NaN;
        resampleStream.point = linePoint;
        stream.lineStart();
      }
      function linePoint(lambda, phi) {
        var c = cartesian([lambda, phi]), p = project(lambda, phi);
        resampleLineTo(x05, y05, lambda0, a0, b0, c0, x05 = p[0], y05 = p[1], lambda0 = lambda, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
        stream.point(x05, y05);
      }
      function lineEnd() {
        resampleStream.point = point;
        stream.lineEnd();
      }
      function ringStart() {
        lineStart();
        resampleStream.point = ringPoint;
        resampleStream.lineEnd = ringEnd;
      }
      function ringPoint(lambda, phi) {
        linePoint(lambda00 = lambda, phi), x004 = x05, y004 = y05, a00 = a0, b00 = b0, c00 = c0;
        resampleStream.point = linePoint;
      }
      function ringEnd() {
        resampleLineTo(x05, y05, lambda0, a0, b0, c0, x004, y004, lambda00, a00, b00, c00, maxDepth, stream);
        resampleStream.lineEnd = lineEnd;
        lineEnd();
      }
      return resampleStream;
    };
  }

  // node_modules/d3-geo/src/projection/index.js
  var transformRadians = transformer({
    point: function(x, y) {
      this.stream.point(x * radians, y * radians);
    }
  });
  function transformRotate(rotate) {
    return transformer({
      point: function(x, y) {
        var r = rotate(x, y);
        return this.stream.point(r[0], r[1]);
      }
    });
  }
  function scaleTranslate(k2, dx, dy, sx, sy) {
    function transform2(x, y) {
      x *= sx;
      y *= sy;
      return [dx + k2 * x, dy - k2 * y];
    }
    transform2.invert = function(x, y) {
      return [(x - dx) / k2 * sx, (dy - y) / k2 * sy];
    };
    return transform2;
  }
  function scaleTranslateRotate(k2, dx, dy, sx, sy, alpha) {
    if (!alpha) return scaleTranslate(k2, dx, dy, sx, sy);
    var cosAlpha = cos(alpha), sinAlpha = sin(alpha), a = cosAlpha * k2, b = sinAlpha * k2, ai = cosAlpha / k2, bi = sinAlpha / k2, ci = (sinAlpha * dy - cosAlpha * dx) / k2, fi = (sinAlpha * dx + cosAlpha * dy) / k2;
    function transform2(x, y) {
      x *= sx;
      y *= sy;
      return [a * x - b * y + dx, dy - b * x - a * y];
    }
    transform2.invert = function(x, y) {
      return [sx * (ai * x - bi * y + ci), sy * (fi - bi * x - ai * y)];
    };
    return transform2;
  }
  function projection(project) {
    return projectionMutator(function() {
      return project;
    })();
  }
  function projectionMutator(projectAt) {
    var project, k2 = 150, x = 480, y = 250, lambda = 0, phi = 0, deltaLambda = 0, deltaPhi = 0, deltaGamma = 0, rotate, alpha = 0, sx = 1, sy = 1, theta = null, preclip = antimeridian_default, x05 = null, y05, x12, y12, postclip = identity_default, delta2 = 0.5, projectResample, projectTransform, projectRotateTransform, cache, cacheStream;
    function projection3(point) {
      return projectRotateTransform(point[0] * radians, point[1] * radians);
    }
    function invert(point) {
      point = projectRotateTransform.invert(point[0], point[1]);
      return point && [point[0] * degrees, point[1] * degrees];
    }
    projection3.stream = function(stream) {
      return cache && cacheStream === stream ? cache : cache = transformRadians(transformRotate(rotate)(preclip(projectResample(postclip(cacheStream = stream)))));
    };
    projection3.preclip = function(_) {
      return arguments.length ? (preclip = _, theta = void 0, reset()) : preclip;
    };
    projection3.postclip = function(_) {
      return arguments.length ? (postclip = _, x05 = y05 = x12 = y12 = null, reset()) : postclip;
    };
    projection3.clipAngle = function(_) {
      return arguments.length ? (preclip = +_ ? circle_default(theta = _ * radians) : (theta = null, antimeridian_default), reset()) : theta * degrees;
    };
    projection3.clipExtent = function(_) {
      return arguments.length ? (postclip = _ == null ? (x05 = y05 = x12 = y12 = null, identity_default) : clipRectangle(x05 = +_[0][0], y05 = +_[0][1], x12 = +_[1][0], y12 = +_[1][1]), reset()) : x05 == null ? null : [[x05, y05], [x12, y12]];
    };
    projection3.scale = function(_) {
      return arguments.length ? (k2 = +_, recenter()) : k2;
    };
    projection3.translate = function(_) {
      return arguments.length ? (x = +_[0], y = +_[1], recenter()) : [x, y];
    };
    projection3.center = function(_) {
      return arguments.length ? (lambda = _[0] % 360 * radians, phi = _[1] % 360 * radians, recenter()) : [lambda * degrees, phi * degrees];
    };
    projection3.rotate = function(_) {
      return arguments.length ? (deltaLambda = _[0] % 360 * radians, deltaPhi = _[1] % 360 * radians, deltaGamma = _.length > 2 ? _[2] % 360 * radians : 0, recenter()) : [deltaLambda * degrees, deltaPhi * degrees, deltaGamma * degrees];
    };
    projection3.angle = function(_) {
      return arguments.length ? (alpha = _ % 360 * radians, recenter()) : alpha * degrees;
    };
    projection3.reflectX = function(_) {
      return arguments.length ? (sx = _ ? -1 : 1, recenter()) : sx < 0;
    };
    projection3.reflectY = function(_) {
      return arguments.length ? (sy = _ ? -1 : 1, recenter()) : sy < 0;
    };
    projection3.precision = function(_) {
      return arguments.length ? (projectResample = resample_default(projectTransform, delta2 = _ * _), reset()) : sqrt(delta2);
    };
    projection3.fitExtent = function(extent, object) {
      return fitExtent(projection3, extent, object);
    };
    projection3.fitSize = function(size, object) {
      return fitSize(projection3, size, object);
    };
    projection3.fitWidth = function(width, object) {
      return fitWidth(projection3, width, object);
    };
    projection3.fitHeight = function(height, object) {
      return fitHeight(projection3, height, object);
    };
    function recenter() {
      var center = scaleTranslateRotate(k2, 0, 0, sx, sy, alpha).apply(null, project(lambda, phi)), transform2 = scaleTranslateRotate(k2, x - center[0], y - center[1], sx, sy, alpha);
      rotate = rotateRadians(deltaLambda, deltaPhi, deltaGamma);
      projectTransform = compose_default(project, transform2);
      projectRotateTransform = compose_default(rotate, projectTransform);
      projectResample = resample_default(projectTransform, delta2);
      return reset();
    }
    function reset() {
      cache = cacheStream = null;
      return projection3;
    }
    return function() {
      project = projectAt.apply(this, arguments);
      projection3.invert = project.invert && invert;
      return recenter();
    };
  }

  // node_modules/d3-geo/src/projection/naturalEarth1.js
  function naturalEarth1Raw(lambda, phi) {
    var phi2 = phi * phi, phi4 = phi2 * phi2;
    return [
      lambda * (0.8707 - 0.131979 * phi2 + phi4 * (-0.013791 + phi4 * (3971e-6 * phi2 - 1529e-6 * phi4))),
      phi * (1.007226 + phi2 * (0.015085 + phi4 * (-0.044475 + 0.028874 * phi2 - 5916e-6 * phi4)))
    ];
  }
  naturalEarth1Raw.invert = function(x, y) {
    var phi = y, i = 25, delta;
    do {
      var phi2 = phi * phi, phi4 = phi2 * phi2;
      phi -= delta = (phi * (1.007226 + phi2 * (0.015085 + phi4 * (-0.044475 + 0.028874 * phi2 - 5916e-6 * phi4))) - y) / (1.007226 + phi2 * (0.015085 * 3 + phi4 * (-0.044475 * 7 + 0.028874 * 9 * phi2 - 5916e-6 * 11 * phi4)));
    } while (abs(delta) > epsilon && --i > 0);
    return [
      x / (0.8707 + (phi2 = phi * phi) * (-0.131979 + phi2 * (-0.013791 + phi2 * phi2 * phi2 * (3971e-6 - 1529e-6 * phi2)))),
      phi
    ];
  };
  function naturalEarth1_default() {
    return projection(naturalEarth1Raw).scale(175.295);
  }

  // node_modules/d3-selection/src/namespaces.js
  var xhtml = "http://www.w3.org/1999/xhtml";
  var namespaces_default = {
    svg: "http://www.w3.org/2000/svg",
    xhtml,
    xlink: "http://www.w3.org/1999/xlink",
    xml: "http://www.w3.org/XML/1998/namespace",
    xmlns: "http://www.w3.org/2000/xmlns/"
  };

  // node_modules/d3-selection/src/namespace.js
  function namespace_default(name) {
    var prefix = name += "", i = prefix.indexOf(":");
    if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
    return namespaces_default.hasOwnProperty(prefix) ? { space: namespaces_default[prefix], local: name } : name;
  }

  // node_modules/d3-selection/src/creator.js
  function creatorInherit(name) {
    return function() {
      var document2 = this.ownerDocument, uri = this.namespaceURI;
      return uri === xhtml && document2.documentElement.namespaceURI === xhtml ? document2.createElement(name) : document2.createElementNS(uri, name);
    };
  }
  function creatorFixed(fullname) {
    return function() {
      return this.ownerDocument.createElementNS(fullname.space, fullname.local);
    };
  }
  function creator_default(name) {
    var fullname = namespace_default(name);
    return (fullname.local ? creatorFixed : creatorInherit)(fullname);
  }

  // node_modules/d3-selection/src/selector.js
  function none() {
  }
  function selector_default(selector) {
    return selector == null ? none : function() {
      return this.querySelector(selector);
    };
  }

  // node_modules/d3-selection/src/selection/select.js
  function select_default(select) {
    if (typeof select !== "function") select = selector_default(select);
    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
        if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
          if ("__data__" in node) subnode.__data__ = node.__data__;
          subgroup[i] = subnode;
        }
      }
    }
    return new Selection(subgroups, this._parents);
  }

  // node_modules/d3-selection/src/array.js
  function array(x) {
    return x == null ? [] : Array.isArray(x) ? x : Array.from(x);
  }

  // node_modules/d3-selection/src/selectorAll.js
  function empty() {
    return [];
  }
  function selectorAll_default(selector) {
    return selector == null ? empty : function() {
      return this.querySelectorAll(selector);
    };
  }

  // node_modules/d3-selection/src/selection/selectAll.js
  function arrayAll(select) {
    return function() {
      return array(select.apply(this, arguments));
    };
  }
  function selectAll_default(select) {
    if (typeof select === "function") select = arrayAll(select);
    else select = selectorAll_default(select);
    for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          subgroups.push(select.call(node, node.__data__, i, group));
          parents.push(node);
        }
      }
    }
    return new Selection(subgroups, parents);
  }

  // node_modules/d3-selection/src/matcher.js
  function matcher_default(selector) {
    return function() {
      return this.matches(selector);
    };
  }
  function childMatcher(selector) {
    return function(node) {
      return node.matches(selector);
    };
  }

  // node_modules/d3-selection/src/selection/selectChild.js
  var find = Array.prototype.find;
  function childFind(match) {
    return function() {
      return find.call(this.children, match);
    };
  }
  function childFirst() {
    return this.firstElementChild;
  }
  function selectChild_default(match) {
    return this.select(match == null ? childFirst : childFind(typeof match === "function" ? match : childMatcher(match)));
  }

  // node_modules/d3-selection/src/selection/selectChildren.js
  var filter = Array.prototype.filter;
  function children() {
    return Array.from(this.children);
  }
  function childrenFilter(match) {
    return function() {
      return filter.call(this.children, match);
    };
  }
  function selectChildren_default(match) {
    return this.selectAll(match == null ? children : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
  }

  // node_modules/d3-selection/src/selection/filter.js
  function filter_default(match) {
    if (typeof match !== "function") match = matcher_default(match);
    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
        if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
          subgroup.push(node);
        }
      }
    }
    return new Selection(subgroups, this._parents);
  }

  // node_modules/d3-selection/src/selection/sparse.js
  function sparse_default(update) {
    return new Array(update.length);
  }

  // node_modules/d3-selection/src/selection/enter.js
  function enter_default() {
    return new Selection(this._enter || this._groups.map(sparse_default), this._parents);
  }
  function EnterNode(parent, datum2) {
    this.ownerDocument = parent.ownerDocument;
    this.namespaceURI = parent.namespaceURI;
    this._next = null;
    this._parent = parent;
    this.__data__ = datum2;
  }
  EnterNode.prototype = {
    constructor: EnterNode,
    appendChild: function(child) {
      return this._parent.insertBefore(child, this._next);
    },
    insertBefore: function(child, next) {
      return this._parent.insertBefore(child, next);
    },
    querySelector: function(selector) {
      return this._parent.querySelector(selector);
    },
    querySelectorAll: function(selector) {
      return this._parent.querySelectorAll(selector);
    }
  };

  // node_modules/d3-selection/src/constant.js
  function constant_default(x) {
    return function() {
      return x;
    };
  }

  // node_modules/d3-selection/src/selection/data.js
  function bindIndex(parent, group, enter, update, exit, data) {
    var i = 0, node, groupLength = group.length, dataLength = data.length;
    for (; i < dataLength; ++i) {
      if (node = group[i]) {
        node.__data__ = data[i];
        update[i] = node;
      } else {
        enter[i] = new EnterNode(parent, data[i]);
      }
    }
    for (; i < groupLength; ++i) {
      if (node = group[i]) {
        exit[i] = node;
      }
    }
  }
  function bindKey(parent, group, enter, update, exit, data, key) {
    var i, node, nodeByKeyValue = /* @__PURE__ */ new Map(), groupLength = group.length, dataLength = data.length, keyValues = new Array(groupLength), keyValue;
    for (i = 0; i < groupLength; ++i) {
      if (node = group[i]) {
        keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
        if (nodeByKeyValue.has(keyValue)) {
          exit[i] = node;
        } else {
          nodeByKeyValue.set(keyValue, node);
        }
      }
    }
    for (i = 0; i < dataLength; ++i) {
      keyValue = key.call(parent, data[i], i, data) + "";
      if (node = nodeByKeyValue.get(keyValue)) {
        update[i] = node;
        node.__data__ = data[i];
        nodeByKeyValue.delete(keyValue);
      } else {
        enter[i] = new EnterNode(parent, data[i]);
      }
    }
    for (i = 0; i < groupLength; ++i) {
      if ((node = group[i]) && nodeByKeyValue.get(keyValues[i]) === node) {
        exit[i] = node;
      }
    }
  }
  function datum(node) {
    return node.__data__;
  }
  function data_default(value, key) {
    if (!arguments.length) return Array.from(this, datum);
    var bind = key ? bindKey : bindIndex, parents = this._parents, groups = this._groups;
    if (typeof value !== "function") value = constant_default(value);
    for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
      var parent = parents[j], group = groups[j], groupLength = group.length, data = arraylike(value.call(parent, parent && parent.__data__, j, parents)), dataLength = data.length, enterGroup = enter[j] = new Array(dataLength), updateGroup = update[j] = new Array(dataLength), exitGroup = exit[j] = new Array(groupLength);
      bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);
      for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
        if (previous = enterGroup[i0]) {
          if (i0 >= i1) i1 = i0 + 1;
          while (!(next = updateGroup[i1]) && ++i1 < dataLength) ;
          previous._next = next || null;
        }
      }
    }
    update = new Selection(update, parents);
    update._enter = enter;
    update._exit = exit;
    return update;
  }
  function arraylike(data) {
    return typeof data === "object" && "length" in data ? data : Array.from(data);
  }

  // node_modules/d3-selection/src/selection/exit.js
  function exit_default() {
    return new Selection(this._exit || this._groups.map(sparse_default), this._parents);
  }

  // node_modules/d3-selection/src/selection/join.js
  function join_default(onenter, onupdate, onexit) {
    var enter = this.enter(), update = this, exit = this.exit();
    if (typeof onenter === "function") {
      enter = onenter(enter);
      if (enter) enter = enter.selection();
    } else {
      enter = enter.append(onenter + "");
    }
    if (onupdate != null) {
      update = onupdate(update);
      if (update) update = update.selection();
    }
    if (onexit == null) exit.remove();
    else onexit(exit);
    return enter && update ? enter.merge(update).order() : update;
  }

  // node_modules/d3-selection/src/selection/merge.js
  function merge_default(context) {
    var selection2 = context.selection ? context.selection() : context;
    for (var groups0 = this._groups, groups1 = selection2._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
      for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge2 = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group0[i] || group1[i]) {
          merge2[i] = node;
        }
      }
    }
    for (; j < m0; ++j) {
      merges[j] = groups0[j];
    }
    return new Selection(merges, this._parents);
  }

  // node_modules/d3-selection/src/selection/order.js
  function order_default() {
    for (var groups = this._groups, j = -1, m = groups.length; ++j < m; ) {
      for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0; ) {
        if (node = group[i]) {
          if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
          next = node;
        }
      }
    }
    return this;
  }

  // node_modules/d3-selection/src/selection/sort.js
  function sort_default(compare) {
    if (!compare) compare = ascending;
    function compareNode(a, b) {
      return a && b ? compare(a.__data__, b.__data__) : !a - !b;
    }
    for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          sortgroup[i] = node;
        }
      }
      sortgroup.sort(compareNode);
    }
    return new Selection(sortgroups, this._parents).order();
  }
  function ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  // node_modules/d3-selection/src/selection/call.js
  function call_default() {
    var callback = arguments[0];
    arguments[0] = this;
    callback.apply(null, arguments);
    return this;
  }

  // node_modules/d3-selection/src/selection/nodes.js
  function nodes_default() {
    return Array.from(this);
  }

  // node_modules/d3-selection/src/selection/node.js
  function node_default() {
    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
        var node = group[i];
        if (node) return node;
      }
    }
    return null;
  }

  // node_modules/d3-selection/src/selection/size.js
  function size_default() {
    let size = 0;
    for (const node of this) ++size;
    return size;
  }

  // node_modules/d3-selection/src/selection/empty.js
  function empty_default() {
    return !this.node();
  }

  // node_modules/d3-selection/src/selection/each.js
  function each_default(callback) {
    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
        if (node = group[i]) callback.call(node, node.__data__, i, group);
      }
    }
    return this;
  }

  // node_modules/d3-selection/src/selection/attr.js
  function attrRemove(name) {
    return function() {
      this.removeAttribute(name);
    };
  }
  function attrRemoveNS(fullname) {
    return function() {
      this.removeAttributeNS(fullname.space, fullname.local);
    };
  }
  function attrConstant(name, value) {
    return function() {
      this.setAttribute(name, value);
    };
  }
  function attrConstantNS(fullname, value) {
    return function() {
      this.setAttributeNS(fullname.space, fullname.local, value);
    };
  }
  function attrFunction(name, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.removeAttribute(name);
      else this.setAttribute(name, v);
    };
  }
  function attrFunctionNS(fullname, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
      else this.setAttributeNS(fullname.space, fullname.local, v);
    };
  }
  function attr_default(name, value) {
    var fullname = namespace_default(name);
    if (arguments.length < 2) {
      var node = this.node();
      return fullname.local ? node.getAttributeNS(fullname.space, fullname.local) : node.getAttribute(fullname);
    }
    return this.each((value == null ? fullname.local ? attrRemoveNS : attrRemove : typeof value === "function" ? fullname.local ? attrFunctionNS : attrFunction : fullname.local ? attrConstantNS : attrConstant)(fullname, value));
  }

  // node_modules/d3-selection/src/window.js
  function window_default(node) {
    return node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView;
  }

  // node_modules/d3-selection/src/selection/style.js
  function styleRemove(name) {
    return function() {
      this.style.removeProperty(name);
    };
  }
  function styleConstant(name, value, priority) {
    return function() {
      this.style.setProperty(name, value, priority);
    };
  }
  function styleFunction(name, value, priority) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.style.removeProperty(name);
      else this.style.setProperty(name, v, priority);
    };
  }
  function style_default(name, value, priority) {
    return arguments.length > 1 ? this.each((value == null ? styleRemove : typeof value === "function" ? styleFunction : styleConstant)(name, value, priority == null ? "" : priority)) : styleValue(this.node(), name);
  }
  function styleValue(node, name) {
    return node.style.getPropertyValue(name) || window_default(node).getComputedStyle(node, null).getPropertyValue(name);
  }

  // node_modules/d3-selection/src/selection/property.js
  function propertyRemove(name) {
    return function() {
      delete this[name];
    };
  }
  function propertyConstant(name, value) {
    return function() {
      this[name] = value;
    };
  }
  function propertyFunction(name, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) delete this[name];
      else this[name] = v;
    };
  }
  function property_default(name, value) {
    return arguments.length > 1 ? this.each((value == null ? propertyRemove : typeof value === "function" ? propertyFunction : propertyConstant)(name, value)) : this.node()[name];
  }

  // node_modules/d3-selection/src/selection/classed.js
  function classArray(string) {
    return string.trim().split(/^|\s+/);
  }
  function classList(node) {
    return node.classList || new ClassList(node);
  }
  function ClassList(node) {
    this._node = node;
    this._names = classArray(node.getAttribute("class") || "");
  }
  ClassList.prototype = {
    add: function(name) {
      var i = this._names.indexOf(name);
      if (i < 0) {
        this._names.push(name);
        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    remove: function(name) {
      var i = this._names.indexOf(name);
      if (i >= 0) {
        this._names.splice(i, 1);
        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    contains: function(name) {
      return this._names.indexOf(name) >= 0;
    }
  };
  function classedAdd(node, names) {
    var list = classList(node), i = -1, n = names.length;
    while (++i < n) list.add(names[i]);
  }
  function classedRemove(node, names) {
    var list = classList(node), i = -1, n = names.length;
    while (++i < n) list.remove(names[i]);
  }
  function classedTrue(names) {
    return function() {
      classedAdd(this, names);
    };
  }
  function classedFalse(names) {
    return function() {
      classedRemove(this, names);
    };
  }
  function classedFunction(names, value) {
    return function() {
      (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
    };
  }
  function classed_default(name, value) {
    var names = classArray(name + "");
    if (arguments.length < 2) {
      var list = classList(this.node()), i = -1, n = names.length;
      while (++i < n) if (!list.contains(names[i])) return false;
      return true;
    }
    return this.each((typeof value === "function" ? classedFunction : value ? classedTrue : classedFalse)(names, value));
  }

  // node_modules/d3-selection/src/selection/text.js
  function textRemove() {
    this.textContent = "";
  }
  function textConstant(value) {
    return function() {
      this.textContent = value;
    };
  }
  function textFunction(value) {
    return function() {
      var v = value.apply(this, arguments);
      this.textContent = v == null ? "" : v;
    };
  }
  function text_default(value) {
    return arguments.length ? this.each(value == null ? textRemove : (typeof value === "function" ? textFunction : textConstant)(value)) : this.node().textContent;
  }

  // node_modules/d3-selection/src/selection/html.js
  function htmlRemove() {
    this.innerHTML = "";
  }
  function htmlConstant(value) {
    return function() {
      this.innerHTML = value;
    };
  }
  function htmlFunction(value) {
    return function() {
      var v = value.apply(this, arguments);
      this.innerHTML = v == null ? "" : v;
    };
  }
  function html_default(value) {
    return arguments.length ? this.each(value == null ? htmlRemove : (typeof value === "function" ? htmlFunction : htmlConstant)(value)) : this.node().innerHTML;
  }

  // node_modules/d3-selection/src/selection/raise.js
  function raise() {
    if (this.nextSibling) this.parentNode.appendChild(this);
  }
  function raise_default() {
    return this.each(raise);
  }

  // node_modules/d3-selection/src/selection/lower.js
  function lower() {
    if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
  }
  function lower_default() {
    return this.each(lower);
  }

  // node_modules/d3-selection/src/selection/append.js
  function append_default(name) {
    var create2 = typeof name === "function" ? name : creator_default(name);
    return this.select(function() {
      return this.appendChild(create2.apply(this, arguments));
    });
  }

  // node_modules/d3-selection/src/selection/insert.js
  function constantNull() {
    return null;
  }
  function insert_default(name, before) {
    var create2 = typeof name === "function" ? name : creator_default(name), select = before == null ? constantNull : typeof before === "function" ? before : selector_default(before);
    return this.select(function() {
      return this.insertBefore(create2.apply(this, arguments), select.apply(this, arguments) || null);
    });
  }

  // node_modules/d3-selection/src/selection/remove.js
  function remove() {
    var parent = this.parentNode;
    if (parent) parent.removeChild(this);
  }
  function remove_default() {
    return this.each(remove);
  }

  // node_modules/d3-selection/src/selection/clone.js
  function selection_cloneShallow() {
    var clone = this.cloneNode(false), parent = this.parentNode;
    return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
  }
  function selection_cloneDeep() {
    var clone = this.cloneNode(true), parent = this.parentNode;
    return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
  }
  function clone_default(deep) {
    return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
  }

  // node_modules/d3-selection/src/selection/datum.js
  function datum_default(value) {
    return arguments.length ? this.property("__data__", value) : this.node().__data__;
  }

  // node_modules/d3-selection/src/selection/on.js
  function contextListener(listener) {
    return function(event) {
      listener.call(this, event, this.__data__);
    };
  }
  function parseTypenames(typenames) {
    return typenames.trim().split(/^|\s+/).map(function(t2) {
      var name = "", i = t2.indexOf(".");
      if (i >= 0) name = t2.slice(i + 1), t2 = t2.slice(0, i);
      return { type: t2, name };
    });
  }
  function onRemove(typename) {
    return function() {
      var on = this.__on;
      if (!on) return;
      for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
        if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.options);
        } else {
          on[++i] = o;
        }
      }
      if (++i) on.length = i;
      else delete this.__on;
    };
  }
  function onAdd(typename, value, options) {
    return function() {
      var on = this.__on, o, listener = contextListener(value);
      if (on) for (var j = 0, m = on.length; j < m; ++j) {
        if ((o = on[j]).type === typename.type && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.options);
          this.addEventListener(o.type, o.listener = listener, o.options = options);
          o.value = value;
          return;
        }
      }
      this.addEventListener(typename.type, listener, options);
      o = { type: typename.type, name: typename.name, value, listener, options };
      if (!on) this.__on = [o];
      else on.push(o);
    };
  }
  function on_default(typename, value, options) {
    var typenames = parseTypenames(typename + ""), i, n = typenames.length, t2;
    if (arguments.length < 2) {
      var on = this.node().__on;
      if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
        for (i = 0, o = on[j]; i < n; ++i) {
          if ((t2 = typenames[i]).type === o.type && t2.name === o.name) {
            return o.value;
          }
        }
      }
      return;
    }
    on = value ? onAdd : onRemove;
    for (i = 0; i < n; ++i) this.each(on(typenames[i], value, options));
    return this;
  }

  // node_modules/d3-selection/src/selection/dispatch.js
  function dispatchEvent(node, type, params) {
    var window2 = window_default(node), event = window2.CustomEvent;
    if (typeof event === "function") {
      event = new event(type, params);
    } else {
      event = window2.document.createEvent("Event");
      if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
      else event.initEvent(type, false, false);
    }
    node.dispatchEvent(event);
  }
  function dispatchConstant(type, params) {
    return function() {
      return dispatchEvent(this, type, params);
    };
  }
  function dispatchFunction(type, params) {
    return function() {
      return dispatchEvent(this, type, params.apply(this, arguments));
    };
  }
  function dispatch_default(type, params) {
    return this.each((typeof params === "function" ? dispatchFunction : dispatchConstant)(type, params));
  }

  // node_modules/d3-selection/src/selection/iterator.js
  function* iterator_default() {
    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
        if (node = group[i]) yield node;
      }
    }
  }

  // node_modules/d3-selection/src/selection/index.js
  var root = [null];
  function Selection(groups, parents) {
    this._groups = groups;
    this._parents = parents;
  }
  function selection() {
    return new Selection([[document.documentElement]], root);
  }
  function selection_selection() {
    return this;
  }
  Selection.prototype = selection.prototype = {
    constructor: Selection,
    select: select_default,
    selectAll: selectAll_default,
    selectChild: selectChild_default,
    selectChildren: selectChildren_default,
    filter: filter_default,
    data: data_default,
    enter: enter_default,
    exit: exit_default,
    join: join_default,
    merge: merge_default,
    selection: selection_selection,
    order: order_default,
    sort: sort_default,
    call: call_default,
    nodes: nodes_default,
    node: node_default,
    size: size_default,
    empty: empty_default,
    each: each_default,
    attr: attr_default,
    style: style_default,
    property: property_default,
    classed: classed_default,
    text: text_default,
    html: html_default,
    raise: raise_default,
    lower: lower_default,
    append: append_default,
    insert: insert_default,
    remove: remove_default,
    clone: clone_default,
    datum: datum_default,
    on: on_default,
    dispatch: dispatch_default,
    [Symbol.iterator]: iterator_default
  };
  var selection_default = selection;

  // node_modules/d3-selection/src/select.js
  function select_default2(selector) {
    return typeof selector === "string" ? new Selection([[document.querySelector(selector)]], [document.documentElement]) : new Selection([[selector]], root);
  }

  // node_modules/d3-selection/src/sourceEvent.js
  function sourceEvent_default(event) {
    let sourceEvent;
    while (sourceEvent = event.sourceEvent) event = sourceEvent;
    return event;
  }

  // node_modules/d3-selection/src/pointer.js
  function pointer_default(event, node) {
    event = sourceEvent_default(event);
    if (node === void 0) node = event.currentTarget;
    if (node) {
      var svg2 = node.ownerSVGElement || node;
      if (svg2.createSVGPoint) {
        var point = svg2.createSVGPoint();
        point.x = event.clientX, point.y = event.clientY;
        point = point.matrixTransform(node.getScreenCTM().inverse());
        return [point.x, point.y];
      }
      if (node.getBoundingClientRect) {
        var rect = node.getBoundingClientRect();
        return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
      }
    }
    return [event.pageX, event.pageY];
  }

  // node_modules/d3-dispatch/src/dispatch.js
  var noop2 = { value: () => {
  } };
  function dispatch() {
    for (var i = 0, n = arguments.length, _ = {}, t2; i < n; ++i) {
      if (!(t2 = arguments[i] + "") || t2 in _ || /[\s.]/.test(t2)) throw new Error("illegal type: " + t2);
      _[t2] = [];
    }
    return new Dispatch(_);
  }
  function Dispatch(_) {
    this._ = _;
  }
  function parseTypenames2(typenames, types) {
    return typenames.trim().split(/^|\s+/).map(function(t2) {
      var name = "", i = t2.indexOf(".");
      if (i >= 0) name = t2.slice(i + 1), t2 = t2.slice(0, i);
      if (t2 && !types.hasOwnProperty(t2)) throw new Error("unknown type: " + t2);
      return { type: t2, name };
    });
  }
  Dispatch.prototype = dispatch.prototype = {
    constructor: Dispatch,
    on: function(typename, callback) {
      var _ = this._, T = parseTypenames2(typename + "", _), t2, i = -1, n = T.length;
      if (arguments.length < 2) {
        while (++i < n) if ((t2 = (typename = T[i]).type) && (t2 = get(_[t2], typename.name))) return t2;
        return;
      }
      if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
      while (++i < n) {
        if (t2 = (typename = T[i]).type) _[t2] = set(_[t2], typename.name, callback);
        else if (callback == null) for (t2 in _) _[t2] = set(_[t2], typename.name, null);
      }
      return this;
    },
    copy: function() {
      var copy = {}, _ = this._;
      for (var t2 in _) copy[t2] = _[t2].slice();
      return new Dispatch(copy);
    },
    call: function(type, that) {
      if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t2; i < n; ++i) args[i] = arguments[i + 2];
      if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
      for (t2 = this._[type], i = 0, n = t2.length; i < n; ++i) t2[i].value.apply(that, args);
    },
    apply: function(type, that, args) {
      if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
      for (var t2 = this._[type], i = 0, n = t2.length; i < n; ++i) t2[i].value.apply(that, args);
    }
  };
  function get(type, name) {
    for (var i = 0, n = type.length, c; i < n; ++i) {
      if ((c = type[i]).name === name) {
        return c.value;
      }
    }
  }
  function set(type, name, callback) {
    for (var i = 0, n = type.length; i < n; ++i) {
      if (type[i].name === name) {
        type[i] = noop2, type = type.slice(0, i).concat(type.slice(i + 1));
        break;
      }
    }
    if (callback != null) type.push({ name, value: callback });
    return type;
  }
  var dispatch_default2 = dispatch;

  // node_modules/d3-drag/src/noevent.js
  var nonpassivecapture = { capture: true, passive: false };
  function noevent_default(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  // node_modules/d3-drag/src/nodrag.js
  function nodrag_default(view) {
    var root3 = view.document.documentElement, selection2 = select_default2(view).on("dragstart.drag", noevent_default, nonpassivecapture);
    if ("onselectstart" in root3) {
      selection2.on("selectstart.drag", noevent_default, nonpassivecapture);
    } else {
      root3.__noselect = root3.style.MozUserSelect;
      root3.style.MozUserSelect = "none";
    }
  }
  function yesdrag(view, noclick) {
    var root3 = view.document.documentElement, selection2 = select_default2(view).on("dragstart.drag", null);
    if (noclick) {
      selection2.on("click.drag", noevent_default, nonpassivecapture);
      setTimeout(function() {
        selection2.on("click.drag", null);
      }, 0);
    }
    if ("onselectstart" in root3) {
      selection2.on("selectstart.drag", null);
    } else {
      root3.style.MozUserSelect = root3.__noselect;
      delete root3.__noselect;
    }
  }

  // node_modules/d3-color/src/define.js
  function define_default(constructor, factory, prototype) {
    constructor.prototype = factory.prototype = prototype;
    prototype.constructor = constructor;
  }
  function extend(parent, definition) {
    var prototype = Object.create(parent.prototype);
    for (var key in definition) prototype[key] = definition[key];
    return prototype;
  }

  // node_modules/d3-color/src/color.js
  function Color() {
  }
  var darker = 0.7;
  var brighter = 1 / darker;
  var reI = "\\s*([+-]?\\d+)\\s*";
  var reN = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*";
  var reP = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*";
  var reHex = /^#([0-9a-f]{3,8})$/;
  var reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`);
  var reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`);
  var reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`);
  var reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`);
  var reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`);
  var reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`);
  var named = {
    aliceblue: 15792383,
    antiquewhite: 16444375,
    aqua: 65535,
    aquamarine: 8388564,
    azure: 15794175,
    beige: 16119260,
    bisque: 16770244,
    black: 0,
    blanchedalmond: 16772045,
    blue: 255,
    blueviolet: 9055202,
    brown: 10824234,
    burlywood: 14596231,
    cadetblue: 6266528,
    chartreuse: 8388352,
    chocolate: 13789470,
    coral: 16744272,
    cornflowerblue: 6591981,
    cornsilk: 16775388,
    crimson: 14423100,
    cyan: 65535,
    darkblue: 139,
    darkcyan: 35723,
    darkgoldenrod: 12092939,
    darkgray: 11119017,
    darkgreen: 25600,
    darkgrey: 11119017,
    darkkhaki: 12433259,
    darkmagenta: 9109643,
    darkolivegreen: 5597999,
    darkorange: 16747520,
    darkorchid: 10040012,
    darkred: 9109504,
    darksalmon: 15308410,
    darkseagreen: 9419919,
    darkslateblue: 4734347,
    darkslategray: 3100495,
    darkslategrey: 3100495,
    darkturquoise: 52945,
    darkviolet: 9699539,
    deeppink: 16716947,
    deepskyblue: 49151,
    dimgray: 6908265,
    dimgrey: 6908265,
    dodgerblue: 2003199,
    firebrick: 11674146,
    floralwhite: 16775920,
    forestgreen: 2263842,
    fuchsia: 16711935,
    gainsboro: 14474460,
    ghostwhite: 16316671,
    gold: 16766720,
    goldenrod: 14329120,
    gray: 8421504,
    green: 32768,
    greenyellow: 11403055,
    grey: 8421504,
    honeydew: 15794160,
    hotpink: 16738740,
    indianred: 13458524,
    indigo: 4915330,
    ivory: 16777200,
    khaki: 15787660,
    lavender: 15132410,
    lavenderblush: 16773365,
    lawngreen: 8190976,
    lemonchiffon: 16775885,
    lightblue: 11393254,
    lightcoral: 15761536,
    lightcyan: 14745599,
    lightgoldenrodyellow: 16448210,
    lightgray: 13882323,
    lightgreen: 9498256,
    lightgrey: 13882323,
    lightpink: 16758465,
    lightsalmon: 16752762,
    lightseagreen: 2142890,
    lightskyblue: 8900346,
    lightslategray: 7833753,
    lightslategrey: 7833753,
    lightsteelblue: 11584734,
    lightyellow: 16777184,
    lime: 65280,
    limegreen: 3329330,
    linen: 16445670,
    magenta: 16711935,
    maroon: 8388608,
    mediumaquamarine: 6737322,
    mediumblue: 205,
    mediumorchid: 12211667,
    mediumpurple: 9662683,
    mediumseagreen: 3978097,
    mediumslateblue: 8087790,
    mediumspringgreen: 64154,
    mediumturquoise: 4772300,
    mediumvioletred: 13047173,
    midnightblue: 1644912,
    mintcream: 16121850,
    mistyrose: 16770273,
    moccasin: 16770229,
    navajowhite: 16768685,
    navy: 128,
    oldlace: 16643558,
    olive: 8421376,
    olivedrab: 7048739,
    orange: 16753920,
    orangered: 16729344,
    orchid: 14315734,
    palegoldenrod: 15657130,
    palegreen: 10025880,
    paleturquoise: 11529966,
    palevioletred: 14381203,
    papayawhip: 16773077,
    peachpuff: 16767673,
    peru: 13468991,
    pink: 16761035,
    plum: 14524637,
    powderblue: 11591910,
    purple: 8388736,
    rebeccapurple: 6697881,
    red: 16711680,
    rosybrown: 12357519,
    royalblue: 4286945,
    saddlebrown: 9127187,
    salmon: 16416882,
    sandybrown: 16032864,
    seagreen: 3050327,
    seashell: 16774638,
    sienna: 10506797,
    silver: 12632256,
    skyblue: 8900331,
    slateblue: 6970061,
    slategray: 7372944,
    slategrey: 7372944,
    snow: 16775930,
    springgreen: 65407,
    steelblue: 4620980,
    tan: 13808780,
    teal: 32896,
    thistle: 14204888,
    tomato: 16737095,
    turquoise: 4251856,
    violet: 15631086,
    wheat: 16113331,
    white: 16777215,
    whitesmoke: 16119285,
    yellow: 16776960,
    yellowgreen: 10145074
  };
  define_default(Color, color, {
    copy(channels) {
      return Object.assign(new this.constructor(), this, channels);
    },
    displayable() {
      return this.rgb().displayable();
    },
    hex: color_formatHex,
    // Deprecated! Use color.formatHex.
    formatHex: color_formatHex,
    formatHex8: color_formatHex8,
    formatHsl: color_formatHsl,
    formatRgb: color_formatRgb,
    toString: color_formatRgb
  });
  function color_formatHex() {
    return this.rgb().formatHex();
  }
  function color_formatHex8() {
    return this.rgb().formatHex8();
  }
  function color_formatHsl() {
    return hslConvert(this).formatHsl();
  }
  function color_formatRgb() {
    return this.rgb().formatRgb();
  }
  function color(format) {
    var m, l;
    format = (format + "").trim().toLowerCase();
    return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) : l === 3 ? new Rgb(m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, (m & 15) << 4 | m & 15, 1) : l === 8 ? rgba(m >> 24 & 255, m >> 16 & 255, m >> 8 & 255, (m & 255) / 255) : l === 4 ? rgba(m >> 12 & 15 | m >> 8 & 240, m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, ((m & 15) << 4 | m & 15) / 255) : null) : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) : named.hasOwnProperty(format) ? rgbn(named[format]) : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
  }
  function rgbn(n) {
    return new Rgb(n >> 16 & 255, n >> 8 & 255, n & 255, 1);
  }
  function rgba(r, g, b, a) {
    if (a <= 0) r = g = b = NaN;
    return new Rgb(r, g, b, a);
  }
  function rgbConvert(o) {
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Rgb();
    o = o.rgb();
    return new Rgb(o.r, o.g, o.b, o.opacity);
  }
  function rgb(r, g, b, opacity) {
    return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
  }
  function Rgb(r, g, b, opacity) {
    this.r = +r;
    this.g = +g;
    this.b = +b;
    this.opacity = +opacity;
  }
  define_default(Rgb, rgb, extend(Color, {
    brighter(k2) {
      k2 = k2 == null ? brighter : Math.pow(brighter, k2);
      return new Rgb(this.r * k2, this.g * k2, this.b * k2, this.opacity);
    },
    darker(k2) {
      k2 = k2 == null ? darker : Math.pow(darker, k2);
      return new Rgb(this.r * k2, this.g * k2, this.b * k2, this.opacity);
    },
    rgb() {
      return this;
    },
    clamp() {
      return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity));
    },
    displayable() {
      return -0.5 <= this.r && this.r < 255.5 && (-0.5 <= this.g && this.g < 255.5) && (-0.5 <= this.b && this.b < 255.5) && (0 <= this.opacity && this.opacity <= 1);
    },
    hex: rgb_formatHex,
    // Deprecated! Use color.formatHex.
    formatHex: rgb_formatHex,
    formatHex8: rgb_formatHex8,
    formatRgb: rgb_formatRgb,
    toString: rgb_formatRgb
  }));
  function rgb_formatHex() {
    return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
  }
  function rgb_formatHex8() {
    return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
  }
  function rgb_formatRgb() {
    const a = clampa(this.opacity);
    return `${a === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a === 1 ? ")" : `, ${a})`}`;
  }
  function clampa(opacity) {
    return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
  }
  function clampi(value) {
    return Math.max(0, Math.min(255, Math.round(value) || 0));
  }
  function hex(value) {
    value = clampi(value);
    return (value < 16 ? "0" : "") + value.toString(16);
  }
  function hsla(h, s, l, a) {
    if (a <= 0) h = s = l = NaN;
    else if (l <= 0 || l >= 1) h = s = NaN;
    else if (s <= 0) h = NaN;
    return new Hsl(h, s, l, a);
  }
  function hslConvert(o) {
    if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Hsl();
    if (o instanceof Hsl) return o;
    o = o.rgb();
    var r = o.r / 255, g = o.g / 255, b = o.b / 255, min = Math.min(r, g, b), max = Math.max(r, g, b), h = NaN, s = max - min, l = (max + min) / 2;
    if (s) {
      if (r === max) h = (g - b) / s + (g < b) * 6;
      else if (g === max) h = (b - r) / s + 2;
      else h = (r - g) / s + 4;
      s /= l < 0.5 ? max + min : 2 - max - min;
      h *= 60;
    } else {
      s = l > 0 && l < 1 ? 0 : h;
    }
    return new Hsl(h, s, l, o.opacity);
  }
  function hsl(h, s, l, opacity) {
    return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
  }
  function Hsl(h, s, l, opacity) {
    this.h = +h;
    this.s = +s;
    this.l = +l;
    this.opacity = +opacity;
  }
  define_default(Hsl, hsl, extend(Color, {
    brighter(k2) {
      k2 = k2 == null ? brighter : Math.pow(brighter, k2);
      return new Hsl(this.h, this.s, this.l * k2, this.opacity);
    },
    darker(k2) {
      k2 = k2 == null ? darker : Math.pow(darker, k2);
      return new Hsl(this.h, this.s, this.l * k2, this.opacity);
    },
    rgb() {
      var h = this.h % 360 + (this.h < 0) * 360, s = isNaN(h) || isNaN(this.s) ? 0 : this.s, l = this.l, m2 = l + (l < 0.5 ? l : 1 - l) * s, m1 = 2 * l - m2;
      return new Rgb(
        hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
        hsl2rgb(h, m1, m2),
        hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
        this.opacity
      );
    },
    clamp() {
      return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity));
    },
    displayable() {
      return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && (0 <= this.l && this.l <= 1) && (0 <= this.opacity && this.opacity <= 1);
    },
    formatHsl() {
      const a = clampa(this.opacity);
      return `${a === 1 ? "hsl(" : "hsla("}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a === 1 ? ")" : `, ${a})`}`;
    }
  }));
  function clamph(value) {
    value = (value || 0) % 360;
    return value < 0 ? value + 360 : value;
  }
  function clampt(value) {
    return Math.max(0, Math.min(1, value || 0));
  }
  function hsl2rgb(h, m1, m2) {
    return (h < 60 ? m1 + (m2 - m1) * h / 60 : h < 180 ? m2 : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60 : m1) * 255;
  }

  // node_modules/d3-interpolate/src/basis.js
  function basis(t1, v0, v1, v2, v3) {
    var t2 = t1 * t1, t3 = t2 * t1;
    return ((1 - 3 * t1 + 3 * t2 - t3) * v0 + (4 - 6 * t2 + 3 * t3) * v1 + (1 + 3 * t1 + 3 * t2 - 3 * t3) * v2 + t3 * v3) / 6;
  }
  function basis_default(values) {
    var n = values.length - 1;
    return function(t2) {
      var i = t2 <= 0 ? t2 = 0 : t2 >= 1 ? (t2 = 1, n - 1) : Math.floor(t2 * n), v1 = values[i], v2 = values[i + 1], v0 = i > 0 ? values[i - 1] : 2 * v1 - v2, v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
      return basis((t2 - i / n) * n, v0, v1, v2, v3);
    };
  }

  // node_modules/d3-interpolate/src/basisClosed.js
  function basisClosed_default(values) {
    var n = values.length;
    return function(t2) {
      var i = Math.floor(((t2 %= 1) < 0 ? ++t2 : t2) * n), v0 = values[(i + n - 1) % n], v1 = values[i % n], v2 = values[(i + 1) % n], v3 = values[(i + 2) % n];
      return basis((t2 - i / n) * n, v0, v1, v2, v3);
    };
  }

  // node_modules/d3-interpolate/src/constant.js
  var constant_default2 = (x) => () => x;

  // node_modules/d3-interpolate/src/color.js
  function linear(a, d) {
    return function(t2) {
      return a + t2 * d;
    };
  }
  function exponential(a, b, y) {
    return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t2) {
      return Math.pow(a + t2 * b, y);
    };
  }
  function gamma(y) {
    return (y = +y) === 1 ? nogamma : function(a, b) {
      return b - a ? exponential(a, b, y) : constant_default2(isNaN(a) ? b : a);
    };
  }
  function nogamma(a, b) {
    var d = b - a;
    return d ? linear(a, d) : constant_default2(isNaN(a) ? b : a);
  }

  // node_modules/d3-interpolate/src/rgb.js
  var rgb_default = (function rgbGamma(y) {
    var color2 = gamma(y);
    function rgb2(start2, end) {
      var r = color2((start2 = rgb(start2)).r, (end = rgb(end)).r), g = color2(start2.g, end.g), b = color2(start2.b, end.b), opacity = nogamma(start2.opacity, end.opacity);
      return function(t2) {
        start2.r = r(t2);
        start2.g = g(t2);
        start2.b = b(t2);
        start2.opacity = opacity(t2);
        return start2 + "";
      };
    }
    rgb2.gamma = rgbGamma;
    return rgb2;
  })(1);
  function rgbSpline(spline) {
    return function(colors) {
      var n = colors.length, r = new Array(n), g = new Array(n), b = new Array(n), i, color2;
      for (i = 0; i < n; ++i) {
        color2 = rgb(colors[i]);
        r[i] = color2.r || 0;
        g[i] = color2.g || 0;
        b[i] = color2.b || 0;
      }
      r = spline(r);
      g = spline(g);
      b = spline(b);
      color2.opacity = 1;
      return function(t2) {
        color2.r = r(t2);
        color2.g = g(t2);
        color2.b = b(t2);
        return color2 + "";
      };
    };
  }
  var rgbBasis = rgbSpline(basis_default);
  var rgbBasisClosed = rgbSpline(basisClosed_default);

  // node_modules/d3-interpolate/src/number.js
  function number_default(a, b) {
    return a = +a, b = +b, function(t2) {
      return a * (1 - t2) + b * t2;
    };
  }

  // node_modules/d3-interpolate/src/string.js
  var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
  var reB = new RegExp(reA.source, "g");
  function zero(b) {
    return function() {
      return b;
    };
  }
  function one(b) {
    return function(t2) {
      return b(t2) + "";
    };
  }
  function string_default(a, b) {
    var bi = reA.lastIndex = reB.lastIndex = 0, am, bm, bs, i = -1, s = [], q = [];
    a = a + "", b = b + "";
    while ((am = reA.exec(a)) && (bm = reB.exec(b))) {
      if ((bs = bm.index) > bi) {
        bs = b.slice(bi, bs);
        if (s[i]) s[i] += bs;
        else s[++i] = bs;
      }
      if ((am = am[0]) === (bm = bm[0])) {
        if (s[i]) s[i] += bm;
        else s[++i] = bm;
      } else {
        s[++i] = null;
        q.push({ i, x: number_default(am, bm) });
      }
      bi = reB.lastIndex;
    }
    if (bi < b.length) {
      bs = b.slice(bi);
      if (s[i]) s[i] += bs;
      else s[++i] = bs;
    }
    return s.length < 2 ? q[0] ? one(q[0].x) : zero(b) : (b = q.length, function(t2) {
      for (var i2 = 0, o; i2 < b; ++i2) s[(o = q[i2]).i] = o.x(t2);
      return s.join("");
    });
  }

  // node_modules/d3-interpolate/src/transform/decompose.js
  var degrees2 = 180 / Math.PI;
  var identity = {
    translateX: 0,
    translateY: 0,
    rotate: 0,
    skewX: 0,
    scaleX: 1,
    scaleY: 1
  };
  function decompose_default(a, b, c, d, e, f) {
    var scaleX, scaleY, skewX;
    if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
    if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
    if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
    if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
    return {
      translateX: e,
      translateY: f,
      rotate: Math.atan2(b, a) * degrees2,
      skewX: Math.atan(skewX) * degrees2,
      scaleX,
      scaleY
    };
  }

  // node_modules/d3-interpolate/src/transform/parse.js
  var svgNode;
  function parseCss(value) {
    const m = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
    return m.isIdentity ? identity : decompose_default(m.a, m.b, m.c, m.d, m.e, m.f);
  }
  function parseSvg(value) {
    if (value == null) return identity;
    if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svgNode.setAttribute("transform", value);
    if (!(value = svgNode.transform.baseVal.consolidate())) return identity;
    value = value.matrix;
    return decompose_default(value.a, value.b, value.c, value.d, value.e, value.f);
  }

  // node_modules/d3-interpolate/src/transform/index.js
  function interpolateTransform(parse, pxComma, pxParen, degParen) {
    function pop(s) {
      return s.length ? s.pop() + " " : "";
    }
    function translate(xa, ya, xb, yb, s, q) {
      if (xa !== xb || ya !== yb) {
        var i = s.push("translate(", null, pxComma, null, pxParen);
        q.push({ i: i - 4, x: number_default(xa, xb) }, { i: i - 2, x: number_default(ya, yb) });
      } else if (xb || yb) {
        s.push("translate(" + xb + pxComma + yb + pxParen);
      }
    }
    function rotate(a, b, s, q) {
      if (a !== b) {
        if (a - b > 180) b += 360;
        else if (b - a > 180) a += 360;
        q.push({ i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: number_default(a, b) });
      } else if (b) {
        s.push(pop(s) + "rotate(" + b + degParen);
      }
    }
    function skewX(a, b, s, q) {
      if (a !== b) {
        q.push({ i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: number_default(a, b) });
      } else if (b) {
        s.push(pop(s) + "skewX(" + b + degParen);
      }
    }
    function scale(xa, ya, xb, yb, s, q) {
      if (xa !== xb || ya !== yb) {
        var i = s.push(pop(s) + "scale(", null, ",", null, ")");
        q.push({ i: i - 4, x: number_default(xa, xb) }, { i: i - 2, x: number_default(ya, yb) });
      } else if (xb !== 1 || yb !== 1) {
        s.push(pop(s) + "scale(" + xb + "," + yb + ")");
      }
    }
    return function(a, b) {
      var s = [], q = [];
      a = parse(a), b = parse(b);
      translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
      rotate(a.rotate, b.rotate, s, q);
      skewX(a.skewX, b.skewX, s, q);
      scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
      a = b = null;
      return function(t2) {
        var i = -1, n = q.length, o;
        while (++i < n) s[(o = q[i]).i] = o.x(t2);
        return s.join("");
      };
    };
  }
  var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
  var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

  // node_modules/d3-interpolate/src/zoom.js
  var epsilon22 = 1e-12;
  function cosh(x) {
    return ((x = Math.exp(x)) + 1 / x) / 2;
  }
  function sinh(x) {
    return ((x = Math.exp(x)) - 1 / x) / 2;
  }
  function tanh(x) {
    return ((x = Math.exp(2 * x)) - 1) / (x + 1);
  }
  var zoom_default = (function zoomRho(rho, rho2, rho4) {
    function zoom(p0, p1) {
      var ux0 = p0[0], uy0 = p0[1], w0 = p0[2], ux1 = p1[0], uy1 = p1[1], w1 = p1[2], dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy, i, S;
      if (d2 < epsilon22) {
        S = Math.log(w1 / w0) / rho;
        i = function(t2) {
          return [
            ux0 + t2 * dx,
            uy0 + t2 * dy,
            w0 * Math.exp(rho * t2 * S)
          ];
        };
      } else {
        var d1 = Math.sqrt(d2), b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1), b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1), r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0), r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
        S = (r1 - r0) / rho;
        i = function(t2) {
          var s = t2 * S, coshr0 = cosh(r0), u = w0 / (rho2 * d1) * (coshr0 * tanh(rho * s + r0) - sinh(r0));
          return [
            ux0 + u * dx,
            uy0 + u * dy,
            w0 * coshr0 / cosh(rho * s + r0)
          ];
        };
      }
      i.duration = S * 1e3 * rho / Math.SQRT2;
      return i;
    }
    zoom.rho = function(_) {
      var _1 = Math.max(1e-3, +_), _2 = _1 * _1, _4 = _2 * _2;
      return zoomRho(_1, _2, _4);
    };
    return zoom;
  })(Math.SQRT2, 2, 4);

  // node_modules/d3-timer/src/timer.js
  var frame = 0;
  var timeout = 0;
  var interval = 0;
  var pokeDelay = 1e3;
  var taskHead;
  var taskTail;
  var clockLast = 0;
  var clockNow = 0;
  var clockSkew = 0;
  var clock = typeof performance === "object" && performance.now ? performance : Date;
  var setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) {
    setTimeout(f, 17);
  };
  function now() {
    return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
  }
  function clearNow() {
    clockNow = 0;
  }
  function Timer() {
    this._call = this._time = this._next = null;
  }
  Timer.prototype = timer.prototype = {
    constructor: Timer,
    restart: function(callback, delay, time) {
      if (typeof callback !== "function") throw new TypeError("callback is not a function");
      time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
      if (!this._next && taskTail !== this) {
        if (taskTail) taskTail._next = this;
        else taskHead = this;
        taskTail = this;
      }
      this._call = callback;
      this._time = time;
      sleep();
    },
    stop: function() {
      if (this._call) {
        this._call = null;
        this._time = Infinity;
        sleep();
      }
    }
  };
  function timer(callback, delay, time) {
    var t2 = new Timer();
    t2.restart(callback, delay, time);
    return t2;
  }
  function timerFlush() {
    now();
    ++frame;
    var t2 = taskHead, e;
    while (t2) {
      if ((e = clockNow - t2._time) >= 0) t2._call.call(void 0, e);
      t2 = t2._next;
    }
    --frame;
  }
  function wake() {
    clockNow = (clockLast = clock.now()) + clockSkew;
    frame = timeout = 0;
    try {
      timerFlush();
    } finally {
      frame = 0;
      nap();
      clockNow = 0;
    }
  }
  function poke() {
    var now2 = clock.now(), delay = now2 - clockLast;
    if (delay > pokeDelay) clockSkew -= delay, clockLast = now2;
  }
  function nap() {
    var t0, t1 = taskHead, t2, time = Infinity;
    while (t1) {
      if (t1._call) {
        if (time > t1._time) time = t1._time;
        t0 = t1, t1 = t1._next;
      } else {
        t2 = t1._next, t1._next = null;
        t1 = t0 ? t0._next = t2 : taskHead = t2;
      }
    }
    taskTail = t0;
    sleep(time);
  }
  function sleep(time) {
    if (frame) return;
    if (timeout) timeout = clearTimeout(timeout);
    var delay = time - clockNow;
    if (delay > 24) {
      if (time < Infinity) timeout = setTimeout(wake, time - clock.now() - clockSkew);
      if (interval) interval = clearInterval(interval);
    } else {
      if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
      frame = 1, setFrame(wake);
    }
  }

  // node_modules/d3-timer/src/timeout.js
  function timeout_default(callback, delay, time) {
    var t2 = new Timer();
    delay = delay == null ? 0 : +delay;
    t2.restart((elapsed) => {
      t2.stop();
      callback(elapsed + delay);
    }, delay, time);
    return t2;
  }

  // node_modules/d3-transition/src/transition/schedule.js
  var emptyOn = dispatch_default2("start", "end", "cancel", "interrupt");
  var emptyTween = [];
  var CREATED = 0;
  var SCHEDULED = 1;
  var STARTING = 2;
  var STARTED = 3;
  var RUNNING = 4;
  var ENDING = 5;
  var ENDED = 6;
  function schedule_default(node, name, id2, index, group, timing) {
    var schedules = node.__transition;
    if (!schedules) node.__transition = {};
    else if (id2 in schedules) return;
    create(node, id2, {
      name,
      index,
      // For context during callback.
      group,
      // For context during callback.
      on: emptyOn,
      tween: emptyTween,
      time: timing.time,
      delay: timing.delay,
      duration: timing.duration,
      ease: timing.ease,
      timer: null,
      state: CREATED
    });
  }
  function init(node, id2) {
    var schedule = get2(node, id2);
    if (schedule.state > CREATED) throw new Error("too late; already scheduled");
    return schedule;
  }
  function set2(node, id2) {
    var schedule = get2(node, id2);
    if (schedule.state > STARTED) throw new Error("too late; already running");
    return schedule;
  }
  function get2(node, id2) {
    var schedule = node.__transition;
    if (!schedule || !(schedule = schedule[id2])) throw new Error("transition not found");
    return schedule;
  }
  function create(node, id2, self) {
    var schedules = node.__transition, tween;
    schedules[id2] = self;
    self.timer = timer(schedule, 0, self.time);
    function schedule(elapsed) {
      self.state = SCHEDULED;
      self.timer.restart(start2, self.delay, self.time);
      if (self.delay <= elapsed) start2(elapsed - self.delay);
    }
    function start2(elapsed) {
      var i, j, n, o;
      if (self.state !== SCHEDULED) return stop();
      for (i in schedules) {
        o = schedules[i];
        if (o.name !== self.name) continue;
        if (o.state === STARTED) return timeout_default(start2);
        if (o.state === RUNNING) {
          o.state = ENDED;
          o.timer.stop();
          o.on.call("interrupt", node, node.__data__, o.index, o.group);
          delete schedules[i];
        } else if (+i < id2) {
          o.state = ENDED;
          o.timer.stop();
          o.on.call("cancel", node, node.__data__, o.index, o.group);
          delete schedules[i];
        }
      }
      timeout_default(function() {
        if (self.state === STARTED) {
          self.state = RUNNING;
          self.timer.restart(tick, self.delay, self.time);
          tick(elapsed);
        }
      });
      self.state = STARTING;
      self.on.call("start", node, node.__data__, self.index, self.group);
      if (self.state !== STARTING) return;
      self.state = STARTED;
      tween = new Array(n = self.tween.length);
      for (i = 0, j = -1; i < n; ++i) {
        if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
          tween[++j] = o;
        }
      }
      tween.length = j + 1;
    }
    function tick(elapsed) {
      var t2 = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1), i = -1, n = tween.length;
      while (++i < n) {
        tween[i].call(node, t2);
      }
      if (self.state === ENDING) {
        self.on.call("end", node, node.__data__, self.index, self.group);
        stop();
      }
    }
    function stop() {
      self.state = ENDED;
      self.timer.stop();
      delete schedules[id2];
      for (var i in schedules) return;
      delete node.__transition;
    }
  }

  // node_modules/d3-transition/src/interrupt.js
  function interrupt_default(node, name) {
    var schedules = node.__transition, schedule, active, empty2 = true, i;
    if (!schedules) return;
    name = name == null ? null : name + "";
    for (i in schedules) {
      if ((schedule = schedules[i]).name !== name) {
        empty2 = false;
        continue;
      }
      active = schedule.state > STARTING && schedule.state < ENDING;
      schedule.state = ENDED;
      schedule.timer.stop();
      schedule.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule.index, schedule.group);
      delete schedules[i];
    }
    if (empty2) delete node.__transition;
  }

  // node_modules/d3-transition/src/selection/interrupt.js
  function interrupt_default2(name) {
    return this.each(function() {
      interrupt_default(this, name);
    });
  }

  // node_modules/d3-transition/src/transition/tween.js
  function tweenRemove(id2, name) {
    var tween0, tween1;
    return function() {
      var schedule = set2(this, id2), tween = schedule.tween;
      if (tween !== tween0) {
        tween1 = tween0 = tween;
        for (var i = 0, n = tween1.length; i < n; ++i) {
          if (tween1[i].name === name) {
            tween1 = tween1.slice();
            tween1.splice(i, 1);
            break;
          }
        }
      }
      schedule.tween = tween1;
    };
  }
  function tweenFunction(id2, name, value) {
    var tween0, tween1;
    if (typeof value !== "function") throw new Error();
    return function() {
      var schedule = set2(this, id2), tween = schedule.tween;
      if (tween !== tween0) {
        tween1 = (tween0 = tween).slice();
        for (var t2 = { name, value }, i = 0, n = tween1.length; i < n; ++i) {
          if (tween1[i].name === name) {
            tween1[i] = t2;
            break;
          }
        }
        if (i === n) tween1.push(t2);
      }
      schedule.tween = tween1;
    };
  }
  function tween_default(name, value) {
    var id2 = this._id;
    name += "";
    if (arguments.length < 2) {
      var tween = get2(this.node(), id2).tween;
      for (var i = 0, n = tween.length, t2; i < n; ++i) {
        if ((t2 = tween[i]).name === name) {
          return t2.value;
        }
      }
      return null;
    }
    return this.each((value == null ? tweenRemove : tweenFunction)(id2, name, value));
  }
  function tweenValue(transition2, name, value) {
    var id2 = transition2._id;
    transition2.each(function() {
      var schedule = set2(this, id2);
      (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
    });
    return function(node) {
      return get2(node, id2).value[name];
    };
  }

  // node_modules/d3-transition/src/transition/interpolate.js
  function interpolate_default(a, b) {
    var c;
    return (typeof b === "number" ? number_default : b instanceof color ? rgb_default : (c = color(b)) ? (b = c, rgb_default) : string_default)(a, b);
  }

  // node_modules/d3-transition/src/transition/attr.js
  function attrRemove2(name) {
    return function() {
      this.removeAttribute(name);
    };
  }
  function attrRemoveNS2(fullname) {
    return function() {
      this.removeAttributeNS(fullname.space, fullname.local);
    };
  }
  function attrConstant2(name, interpolate, value1) {
    var string00, string1 = value1 + "", interpolate0;
    return function() {
      var string0 = this.getAttribute(name);
      return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
    };
  }
  function attrConstantNS2(fullname, interpolate, value1) {
    var string00, string1 = value1 + "", interpolate0;
    return function() {
      var string0 = this.getAttributeNS(fullname.space, fullname.local);
      return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
    };
  }
  function attrFunction2(name, interpolate, value) {
    var string00, string10, interpolate0;
    return function() {
      var string0, value1 = value(this), string1;
      if (value1 == null) return void this.removeAttribute(name);
      string0 = this.getAttribute(name);
      string1 = value1 + "";
      return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }
  function attrFunctionNS2(fullname, interpolate, value) {
    var string00, string10, interpolate0;
    return function() {
      var string0, value1 = value(this), string1;
      if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
      string0 = this.getAttributeNS(fullname.space, fullname.local);
      string1 = value1 + "";
      return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }
  function attr_default2(name, value) {
    var fullname = namespace_default(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate_default;
    return this.attrTween(name, typeof value === "function" ? (fullname.local ? attrFunctionNS2 : attrFunction2)(fullname, i, tweenValue(this, "attr." + name, value)) : value == null ? (fullname.local ? attrRemoveNS2 : attrRemove2)(fullname) : (fullname.local ? attrConstantNS2 : attrConstant2)(fullname, i, value));
  }

  // node_modules/d3-transition/src/transition/attrTween.js
  function attrInterpolate(name, i) {
    return function(t2) {
      this.setAttribute(name, i.call(this, t2));
    };
  }
  function attrInterpolateNS(fullname, i) {
    return function(t2) {
      this.setAttributeNS(fullname.space, fullname.local, i.call(this, t2));
    };
  }
  function attrTweenNS(fullname, value) {
    var t0, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i);
      return t0;
    }
    tween._value = value;
    return tween;
  }
  function attrTween(name, value) {
    var t0, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t0 = (i0 = i) && attrInterpolate(name, i);
      return t0;
    }
    tween._value = value;
    return tween;
  }
  function attrTween_default(name, value) {
    var key = "attr." + name;
    if (arguments.length < 2) return (key = this.tween(key)) && key._value;
    if (value == null) return this.tween(key, null);
    if (typeof value !== "function") throw new Error();
    var fullname = namespace_default(name);
    return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
  }

  // node_modules/d3-transition/src/transition/delay.js
  function delayFunction(id2, value) {
    return function() {
      init(this, id2).delay = +value.apply(this, arguments);
    };
  }
  function delayConstant(id2, value) {
    return value = +value, function() {
      init(this, id2).delay = value;
    };
  }
  function delay_default(value) {
    var id2 = this._id;
    return arguments.length ? this.each((typeof value === "function" ? delayFunction : delayConstant)(id2, value)) : get2(this.node(), id2).delay;
  }

  // node_modules/d3-transition/src/transition/duration.js
  function durationFunction(id2, value) {
    return function() {
      set2(this, id2).duration = +value.apply(this, arguments);
    };
  }
  function durationConstant(id2, value) {
    return value = +value, function() {
      set2(this, id2).duration = value;
    };
  }
  function duration_default(value) {
    var id2 = this._id;
    return arguments.length ? this.each((typeof value === "function" ? durationFunction : durationConstant)(id2, value)) : get2(this.node(), id2).duration;
  }

  // node_modules/d3-transition/src/transition/ease.js
  function easeConstant(id2, value) {
    if (typeof value !== "function") throw new Error();
    return function() {
      set2(this, id2).ease = value;
    };
  }
  function ease_default(value) {
    var id2 = this._id;
    return arguments.length ? this.each(easeConstant(id2, value)) : get2(this.node(), id2).ease;
  }

  // node_modules/d3-transition/src/transition/easeVarying.js
  function easeVarying(id2, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (typeof v !== "function") throw new Error();
      set2(this, id2).ease = v;
    };
  }
  function easeVarying_default(value) {
    if (typeof value !== "function") throw new Error();
    return this.each(easeVarying(this._id, value));
  }

  // node_modules/d3-transition/src/transition/filter.js
  function filter_default2(match) {
    if (typeof match !== "function") match = matcher_default(match);
    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
        if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
          subgroup.push(node);
        }
      }
    }
    return new Transition(subgroups, this._parents, this._name, this._id);
  }

  // node_modules/d3-transition/src/transition/merge.js
  function merge_default2(transition2) {
    if (transition2._id !== this._id) throw new Error();
    for (var groups0 = this._groups, groups1 = transition2._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
      for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge2 = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group0[i] || group1[i]) {
          merge2[i] = node;
        }
      }
    }
    for (; j < m0; ++j) {
      merges[j] = groups0[j];
    }
    return new Transition(merges, this._parents, this._name, this._id);
  }

  // node_modules/d3-transition/src/transition/on.js
  function start(name) {
    return (name + "").trim().split(/^|\s+/).every(function(t2) {
      var i = t2.indexOf(".");
      if (i >= 0) t2 = t2.slice(0, i);
      return !t2 || t2 === "start";
    });
  }
  function onFunction(id2, name, listener) {
    var on0, on1, sit = start(name) ? init : set2;
    return function() {
      var schedule = sit(this, id2), on = schedule.on;
      if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);
      schedule.on = on1;
    };
  }
  function on_default2(name, listener) {
    var id2 = this._id;
    return arguments.length < 2 ? get2(this.node(), id2).on.on(name) : this.each(onFunction(id2, name, listener));
  }

  // node_modules/d3-transition/src/transition/remove.js
  function removeFunction(id2) {
    return function() {
      var parent = this.parentNode;
      for (var i in this.__transition) if (+i !== id2) return;
      if (parent) parent.removeChild(this);
    };
  }
  function remove_default2() {
    return this.on("end.remove", removeFunction(this._id));
  }

  // node_modules/d3-transition/src/transition/select.js
  function select_default3(select) {
    var name = this._name, id2 = this._id;
    if (typeof select !== "function") select = selector_default(select);
    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
        if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
          if ("__data__" in node) subnode.__data__ = node.__data__;
          subgroup[i] = subnode;
          schedule_default(subgroup[i], name, id2, i, subgroup, get2(node, id2));
        }
      }
    }
    return new Transition(subgroups, this._parents, name, id2);
  }

  // node_modules/d3-transition/src/transition/selectAll.js
  function selectAll_default2(select) {
    var name = this._name, id2 = this._id;
    if (typeof select !== "function") select = selectorAll_default(select);
    for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          for (var children2 = select.call(node, node.__data__, i, group), child, inherit2 = get2(node, id2), k2 = 0, l = children2.length; k2 < l; ++k2) {
            if (child = children2[k2]) {
              schedule_default(child, name, id2, k2, children2, inherit2);
            }
          }
          subgroups.push(children2);
          parents.push(node);
        }
      }
    }
    return new Transition(subgroups, parents, name, id2);
  }

  // node_modules/d3-transition/src/transition/selection.js
  var Selection2 = selection_default.prototype.constructor;
  function selection_default2() {
    return new Selection2(this._groups, this._parents);
  }

  // node_modules/d3-transition/src/transition/style.js
  function styleNull(name, interpolate) {
    var string00, string10, interpolate0;
    return function() {
      var string0 = styleValue(this, name), string1 = (this.style.removeProperty(name), styleValue(this, name));
      return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : interpolate0 = interpolate(string00 = string0, string10 = string1);
    };
  }
  function styleRemove2(name) {
    return function() {
      this.style.removeProperty(name);
    };
  }
  function styleConstant2(name, interpolate, value1) {
    var string00, string1 = value1 + "", interpolate0;
    return function() {
      var string0 = styleValue(this, name);
      return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
    };
  }
  function styleFunction2(name, interpolate, value) {
    var string00, string10, interpolate0;
    return function() {
      var string0 = styleValue(this, name), value1 = value(this), string1 = value1 + "";
      if (value1 == null) string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
      return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
    };
  }
  function styleMaybeRemove(id2, name) {
    var on0, on1, listener0, key = "style." + name, event = "end." + key, remove2;
    return function() {
      var schedule = set2(this, id2), on = schedule.on, listener = schedule.value[key] == null ? remove2 || (remove2 = styleRemove2(name)) : void 0;
      if (on !== on0 || listener0 !== listener) (on1 = (on0 = on).copy()).on(event, listener0 = listener);
      schedule.on = on1;
    };
  }
  function style_default2(name, value, priority) {
    var i = (name += "") === "transform" ? interpolateTransformCss : interpolate_default;
    return value == null ? this.styleTween(name, styleNull(name, i)).on("end.style." + name, styleRemove2(name)) : typeof value === "function" ? this.styleTween(name, styleFunction2(name, i, tweenValue(this, "style." + name, value))).each(styleMaybeRemove(this._id, name)) : this.styleTween(name, styleConstant2(name, i, value), priority).on("end.style." + name, null);
  }

  // node_modules/d3-transition/src/transition/styleTween.js
  function styleInterpolate(name, i, priority) {
    return function(t2) {
      this.style.setProperty(name, i.call(this, t2), priority);
    };
  }
  function styleTween(name, value, priority) {
    var t2, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t2 = (i0 = i) && styleInterpolate(name, i, priority);
      return t2;
    }
    tween._value = value;
    return tween;
  }
  function styleTween_default(name, value, priority) {
    var key = "style." + (name += "");
    if (arguments.length < 2) return (key = this.tween(key)) && key._value;
    if (value == null) return this.tween(key, null);
    if (typeof value !== "function") throw new Error();
    return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
  }

  // node_modules/d3-transition/src/transition/text.js
  function textConstant2(value) {
    return function() {
      this.textContent = value;
    };
  }
  function textFunction2(value) {
    return function() {
      var value1 = value(this);
      this.textContent = value1 == null ? "" : value1;
    };
  }
  function text_default2(value) {
    return this.tween("text", typeof value === "function" ? textFunction2(tweenValue(this, "text", value)) : textConstant2(value == null ? "" : value + ""));
  }

  // node_modules/d3-transition/src/transition/textTween.js
  function textInterpolate(i) {
    return function(t2) {
      this.textContent = i.call(this, t2);
    };
  }
  function textTween(value) {
    var t0, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t0 = (i0 = i) && textInterpolate(i);
      return t0;
    }
    tween._value = value;
    return tween;
  }
  function textTween_default(value) {
    var key = "text";
    if (arguments.length < 1) return (key = this.tween(key)) && key._value;
    if (value == null) return this.tween(key, null);
    if (typeof value !== "function") throw new Error();
    return this.tween(key, textTween(value));
  }

  // node_modules/d3-transition/src/transition/transition.js
  function transition_default() {
    var name = this._name, id0 = this._id, id1 = newId();
    for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          var inherit2 = get2(node, id0);
          schedule_default(node, name, id1, i, group, {
            time: inherit2.time + inherit2.delay + inherit2.duration,
            delay: 0,
            duration: inherit2.duration,
            ease: inherit2.ease
          });
        }
      }
    }
    return new Transition(groups, this._parents, name, id1);
  }

  // node_modules/d3-transition/src/transition/end.js
  function end_default() {
    var on0, on1, that = this, id2 = that._id, size = that.size();
    return new Promise(function(resolve, reject) {
      var cancel = { value: reject }, end = { value: function() {
        if (--size === 0) resolve();
      } };
      that.each(function() {
        var schedule = set2(this, id2), on = schedule.on;
        if (on !== on0) {
          on1 = (on0 = on).copy();
          on1._.cancel.push(cancel);
          on1._.interrupt.push(cancel);
          on1._.end.push(end);
        }
        schedule.on = on1;
      });
      if (size === 0) resolve();
    });
  }

  // node_modules/d3-transition/src/transition/index.js
  var id = 0;
  function Transition(groups, parents, name, id2) {
    this._groups = groups;
    this._parents = parents;
    this._name = name;
    this._id = id2;
  }
  function transition(name) {
    return selection_default().transition(name);
  }
  function newId() {
    return ++id;
  }
  var selection_prototype = selection_default.prototype;
  Transition.prototype = transition.prototype = {
    constructor: Transition,
    select: select_default3,
    selectAll: selectAll_default2,
    selectChild: selection_prototype.selectChild,
    selectChildren: selection_prototype.selectChildren,
    filter: filter_default2,
    merge: merge_default2,
    selection: selection_default2,
    transition: transition_default,
    call: selection_prototype.call,
    nodes: selection_prototype.nodes,
    node: selection_prototype.node,
    size: selection_prototype.size,
    empty: selection_prototype.empty,
    each: selection_prototype.each,
    on: on_default2,
    attr: attr_default2,
    attrTween: attrTween_default,
    style: style_default2,
    styleTween: styleTween_default,
    text: text_default2,
    textTween: textTween_default,
    remove: remove_default2,
    tween: tween_default,
    delay: delay_default,
    duration: duration_default,
    ease: ease_default,
    easeVarying: easeVarying_default,
    end: end_default,
    [Symbol.iterator]: selection_prototype[Symbol.iterator]
  };

  // node_modules/d3-ease/src/cubic.js
  function cubicInOut(t2) {
    return ((t2 *= 2) <= 1 ? t2 * t2 * t2 : (t2 -= 2) * t2 * t2 + 2) / 2;
  }

  // node_modules/d3-transition/src/selection/transition.js
  var defaultTiming = {
    time: null,
    // Set on use.
    delay: 0,
    duration: 250,
    ease: cubicInOut
  };
  function inherit(node, id2) {
    var timing;
    while (!(timing = node.__transition) || !(timing = timing[id2])) {
      if (!(node = node.parentNode)) {
        throw new Error(`transition ${id2} not found`);
      }
    }
    return timing;
  }
  function transition_default2(name) {
    var id2, timing;
    if (name instanceof Transition) {
      id2 = name._id, name = name._name;
    } else {
      id2 = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
    }
    for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          schedule_default(node, name, id2, i, group, timing || inherit(node, id2));
        }
      }
    }
    return new Transition(groups, this._parents, name, id2);
  }

  // node_modules/d3-transition/src/selection/index.js
  selection_default.prototype.interrupt = interrupt_default2;
  selection_default.prototype.transition = transition_default2;

  // node_modules/d3-zoom/src/constant.js
  var constant_default3 = (x) => () => x;

  // node_modules/d3-zoom/src/event.js
  function ZoomEvent(type, {
    sourceEvent,
    target,
    transform: transform2,
    dispatch: dispatch2
  }) {
    Object.defineProperties(this, {
      type: { value: type, enumerable: true, configurable: true },
      sourceEvent: { value: sourceEvent, enumerable: true, configurable: true },
      target: { value: target, enumerable: true, configurable: true },
      transform: { value: transform2, enumerable: true, configurable: true },
      _: { value: dispatch2 }
    });
  }

  // node_modules/d3-zoom/src/transform.js
  function Transform(k2, x, y) {
    this.k = k2;
    this.x = x;
    this.y = y;
  }
  Transform.prototype = {
    constructor: Transform,
    scale: function(k2) {
      return k2 === 1 ? this : new Transform(this.k * k2, this.x, this.y);
    },
    translate: function(x, y) {
      return x === 0 & y === 0 ? this : new Transform(this.k, this.x + this.k * x, this.y + this.k * y);
    },
    apply: function(point) {
      return [point[0] * this.k + this.x, point[1] * this.k + this.y];
    },
    applyX: function(x) {
      return x * this.k + this.x;
    },
    applyY: function(y) {
      return y * this.k + this.y;
    },
    invert: function(location2) {
      return [(location2[0] - this.x) / this.k, (location2[1] - this.y) / this.k];
    },
    invertX: function(x) {
      return (x - this.x) / this.k;
    },
    invertY: function(y) {
      return (y - this.y) / this.k;
    },
    rescaleX: function(x) {
      return x.copy().domain(x.range().map(this.invertX, this).map(x.invert, x));
    },
    rescaleY: function(y) {
      return y.copy().domain(y.range().map(this.invertY, this).map(y.invert, y));
    },
    toString: function() {
      return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
    }
  };
  var identity2 = new Transform(1, 0, 0);
  transform.prototype = Transform.prototype;
  function transform(node) {
    while (!node.__zoom) if (!(node = node.parentNode)) return identity2;
    return node.__zoom;
  }

  // node_modules/d3-zoom/src/noevent.js
  function nopropagation(event) {
    event.stopImmediatePropagation();
  }
  function noevent_default2(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  // node_modules/d3-zoom/src/zoom.js
  function defaultFilter(event) {
    return (!event.ctrlKey || event.type === "wheel") && !event.button;
  }
  function defaultExtent() {
    var e = this;
    if (e instanceof SVGElement) {
      e = e.ownerSVGElement || e;
      if (e.hasAttribute("viewBox")) {
        e = e.viewBox.baseVal;
        return [[e.x, e.y], [e.x + e.width, e.y + e.height]];
      }
      return [[0, 0], [e.width.baseVal.value, e.height.baseVal.value]];
    }
    return [[0, 0], [e.clientWidth, e.clientHeight]];
  }
  function defaultTransform() {
    return this.__zoom || identity2;
  }
  function defaultWheelDelta(event) {
    return -event.deltaY * (event.deltaMode === 1 ? 0.05 : event.deltaMode ? 1 : 2e-3) * (event.ctrlKey ? 10 : 1);
  }
  function defaultTouchable() {
    return navigator.maxTouchPoints || "ontouchstart" in this;
  }
  function defaultConstrain(transform2, extent, translateExtent) {
    var dx0 = transform2.invertX(extent[0][0]) - translateExtent[0][0], dx1 = transform2.invertX(extent[1][0]) - translateExtent[1][0], dy0 = transform2.invertY(extent[0][1]) - translateExtent[0][1], dy1 = transform2.invertY(extent[1][1]) - translateExtent[1][1];
    return transform2.translate(
      dx1 > dx0 ? (dx0 + dx1) / 2 : Math.min(0, dx0) || Math.max(0, dx1),
      dy1 > dy0 ? (dy0 + dy1) / 2 : Math.min(0, dy0) || Math.max(0, dy1)
    );
  }
  function zoom_default2() {
    var filter2 = defaultFilter, extent = defaultExtent, constrain = defaultConstrain, wheelDelta = defaultWheelDelta, touchable = defaultTouchable, scaleExtent = [0, Infinity], translateExtent = [[-Infinity, -Infinity], [Infinity, Infinity]], duration = 250, interpolate = zoom_default, listeners = dispatch_default2("start", "zoom", "end"), touchstarting, touchfirst, touchending, touchDelay = 500, wheelDelay = 150, clickDistance2 = 0, tapDistance = 10;
    function zoom(selection2) {
      selection2.property("__zoom", defaultTransform).on("wheel.zoom", wheeled, { passive: false }).on("mousedown.zoom", mousedowned).on("dblclick.zoom", dblclicked).filter(touchable).on("touchstart.zoom", touchstarted).on("touchmove.zoom", touchmoved).on("touchend.zoom touchcancel.zoom", touchended).style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
    }
    zoom.transform = function(collection, transform2, point, event) {
      var selection2 = collection.selection ? collection.selection() : collection;
      selection2.property("__zoom", defaultTransform);
      if (collection !== selection2) {
        schedule(collection, transform2, point, event);
      } else {
        selection2.interrupt().each(function() {
          gesture(this, arguments).event(event).start().zoom(null, typeof transform2 === "function" ? transform2.apply(this, arguments) : transform2).end();
        });
      }
    };
    zoom.scaleBy = function(selection2, k2, p, event) {
      zoom.scaleTo(selection2, function() {
        var k0 = this.__zoom.k, k1 = typeof k2 === "function" ? k2.apply(this, arguments) : k2;
        return k0 * k1;
      }, p, event);
    };
    zoom.scaleTo = function(selection2, k2, p, event) {
      zoom.transform(selection2, function() {
        var e = extent.apply(this, arguments), t0 = this.__zoom, p0 = p == null ? centroid(e) : typeof p === "function" ? p.apply(this, arguments) : p, p1 = t0.invert(p0), k1 = typeof k2 === "function" ? k2.apply(this, arguments) : k2;
        return constrain(translate(scale(t0, k1), p0, p1), e, translateExtent);
      }, p, event);
    };
    zoom.translateBy = function(selection2, x, y, event) {
      zoom.transform(selection2, function() {
        return constrain(this.__zoom.translate(
          typeof x === "function" ? x.apply(this, arguments) : x,
          typeof y === "function" ? y.apply(this, arguments) : y
        ), extent.apply(this, arguments), translateExtent);
      }, null, event);
    };
    zoom.translateTo = function(selection2, x, y, p, event) {
      zoom.transform(selection2, function() {
        var e = extent.apply(this, arguments), t2 = this.__zoom, p0 = p == null ? centroid(e) : typeof p === "function" ? p.apply(this, arguments) : p;
        return constrain(identity2.translate(p0[0], p0[1]).scale(t2.k).translate(
          typeof x === "function" ? -x.apply(this, arguments) : -x,
          typeof y === "function" ? -y.apply(this, arguments) : -y
        ), e, translateExtent);
      }, p, event);
    };
    function scale(transform2, k2) {
      k2 = Math.max(scaleExtent[0], Math.min(scaleExtent[1], k2));
      return k2 === transform2.k ? transform2 : new Transform(k2, transform2.x, transform2.y);
    }
    function translate(transform2, p0, p1) {
      var x = p0[0] - p1[0] * transform2.k, y = p0[1] - p1[1] * transform2.k;
      return x === transform2.x && y === transform2.y ? transform2 : new Transform(transform2.k, x, y);
    }
    function centroid(extent2) {
      return [(+extent2[0][0] + +extent2[1][0]) / 2, (+extent2[0][1] + +extent2[1][1]) / 2];
    }
    function schedule(transition2, transform2, point, event) {
      transition2.on("start.zoom", function() {
        gesture(this, arguments).event(event).start();
      }).on("interrupt.zoom end.zoom", function() {
        gesture(this, arguments).event(event).end();
      }).tween("zoom", function() {
        var that = this, args = arguments, g = gesture(that, args).event(event), e = extent.apply(that, args), p = point == null ? centroid(e) : typeof point === "function" ? point.apply(that, args) : point, w = Math.max(e[1][0] - e[0][0], e[1][1] - e[0][1]), a = that.__zoom, b = typeof transform2 === "function" ? transform2.apply(that, args) : transform2, i = interpolate(a.invert(p).concat(w / a.k), b.invert(p).concat(w / b.k));
        return function(t2) {
          if (t2 === 1) t2 = b;
          else {
            var l = i(t2), k2 = w / l[2];
            t2 = new Transform(k2, p[0] - l[0] * k2, p[1] - l[1] * k2);
          }
          g.zoom(null, t2);
        };
      });
    }
    function gesture(that, args, clean) {
      return !clean && that.__zooming || new Gesture(that, args);
    }
    function Gesture(that, args) {
      this.that = that;
      this.args = args;
      this.active = 0;
      this.sourceEvent = null;
      this.extent = extent.apply(that, args);
      this.taps = 0;
    }
    Gesture.prototype = {
      event: function(event) {
        if (event) this.sourceEvent = event;
        return this;
      },
      start: function() {
        if (++this.active === 1) {
          this.that.__zooming = this;
          this.emit("start");
        }
        return this;
      },
      zoom: function(key, transform2) {
        if (this.mouse && key !== "mouse") this.mouse[1] = transform2.invert(this.mouse[0]);
        if (this.touch0 && key !== "touch") this.touch0[1] = transform2.invert(this.touch0[0]);
        if (this.touch1 && key !== "touch") this.touch1[1] = transform2.invert(this.touch1[0]);
        this.that.__zoom = transform2;
        this.emit("zoom");
        return this;
      },
      end: function() {
        if (--this.active === 0) {
          delete this.that.__zooming;
          this.emit("end");
        }
        return this;
      },
      emit: function(type) {
        var d = select_default2(this.that).datum();
        listeners.call(
          type,
          this.that,
          new ZoomEvent(type, {
            sourceEvent: this.sourceEvent,
            target: zoom,
            type,
            transform: this.that.__zoom,
            dispatch: listeners
          }),
          d
        );
      }
    };
    function wheeled(event, ...args) {
      if (!filter2.apply(this, arguments)) return;
      var g = gesture(this, args).event(event), t2 = this.__zoom, k2 = Math.max(scaleExtent[0], Math.min(scaleExtent[1], t2.k * Math.pow(2, wheelDelta.apply(this, arguments)))), p = pointer_default(event);
      if (g.wheel) {
        if (g.mouse[0][0] !== p[0] || g.mouse[0][1] !== p[1]) {
          g.mouse[1] = t2.invert(g.mouse[0] = p);
        }
        clearTimeout(g.wheel);
      } else if (t2.k === k2) return;
      else {
        g.mouse = [p, t2.invert(p)];
        interrupt_default(this);
        g.start();
      }
      noevent_default2(event);
      g.wheel = setTimeout(wheelidled, wheelDelay);
      g.zoom("mouse", constrain(translate(scale(t2, k2), g.mouse[0], g.mouse[1]), g.extent, translateExtent));
      function wheelidled() {
        g.wheel = null;
        g.end();
      }
    }
    function mousedowned(event, ...args) {
      if (touchending || !filter2.apply(this, arguments)) return;
      var currentTarget = event.currentTarget, g = gesture(this, args, true).event(event), v = select_default2(event.view).on("mousemove.zoom", mousemoved, true).on("mouseup.zoom", mouseupped, true), p = pointer_default(event, currentTarget), x05 = event.clientX, y05 = event.clientY;
      nodrag_default(event.view);
      nopropagation(event);
      g.mouse = [p, this.__zoom.invert(p)];
      interrupt_default(this);
      g.start();
      function mousemoved(event2) {
        noevent_default2(event2);
        if (!g.moved) {
          var dx = event2.clientX - x05, dy = event2.clientY - y05;
          g.moved = dx * dx + dy * dy > clickDistance2;
        }
        g.event(event2).zoom("mouse", constrain(translate(g.that.__zoom, g.mouse[0] = pointer_default(event2, currentTarget), g.mouse[1]), g.extent, translateExtent));
      }
      function mouseupped(event2) {
        v.on("mousemove.zoom mouseup.zoom", null);
        yesdrag(event2.view, g.moved);
        noevent_default2(event2);
        g.event(event2).end();
      }
    }
    function dblclicked(event, ...args) {
      if (!filter2.apply(this, arguments)) return;
      var t0 = this.__zoom, p0 = pointer_default(event.changedTouches ? event.changedTouches[0] : event, this), p1 = t0.invert(p0), k1 = t0.k * (event.shiftKey ? 0.5 : 2), t1 = constrain(translate(scale(t0, k1), p0, p1), extent.apply(this, args), translateExtent);
      noevent_default2(event);
      if (duration > 0) select_default2(this).transition().duration(duration).call(schedule, t1, p0, event);
      else select_default2(this).call(zoom.transform, t1, p0, event);
    }
    function touchstarted(event, ...args) {
      if (!filter2.apply(this, arguments)) return;
      var touches = event.touches, n = touches.length, g = gesture(this, args, event.changedTouches.length === n).event(event), started, i, t2, p;
      nopropagation(event);
      for (i = 0; i < n; ++i) {
        t2 = touches[i], p = pointer_default(t2, this);
        p = [p, this.__zoom.invert(p), t2.identifier];
        if (!g.touch0) g.touch0 = p, started = true, g.taps = 1 + !!touchstarting;
        else if (!g.touch1 && g.touch0[2] !== p[2]) g.touch1 = p, g.taps = 0;
      }
      if (touchstarting) touchstarting = clearTimeout(touchstarting);
      if (started) {
        if (g.taps < 2) touchfirst = p[0], touchstarting = setTimeout(function() {
          touchstarting = null;
        }, touchDelay);
        interrupt_default(this);
        g.start();
      }
    }
    function touchmoved(event, ...args) {
      if (!this.__zooming) return;
      var g = gesture(this, args).event(event), touches = event.changedTouches, n = touches.length, i, t2, p, l;
      noevent_default2(event);
      for (i = 0; i < n; ++i) {
        t2 = touches[i], p = pointer_default(t2, this);
        if (g.touch0 && g.touch0[2] === t2.identifier) g.touch0[0] = p;
        else if (g.touch1 && g.touch1[2] === t2.identifier) g.touch1[0] = p;
      }
      t2 = g.that.__zoom;
      if (g.touch1) {
        var p0 = g.touch0[0], l0 = g.touch0[1], p1 = g.touch1[0], l1 = g.touch1[1], dp = (dp = p1[0] - p0[0]) * dp + (dp = p1[1] - p0[1]) * dp, dl = (dl = l1[0] - l0[0]) * dl + (dl = l1[1] - l0[1]) * dl;
        t2 = scale(t2, Math.sqrt(dp / dl));
        p = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
        l = [(l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2];
      } else if (g.touch0) p = g.touch0[0], l = g.touch0[1];
      else return;
      g.zoom("touch", constrain(translate(t2, p, l), g.extent, translateExtent));
    }
    function touchended(event, ...args) {
      if (!this.__zooming) return;
      var g = gesture(this, args).event(event), touches = event.changedTouches, n = touches.length, i, t2;
      nopropagation(event);
      if (touchending) clearTimeout(touchending);
      touchending = setTimeout(function() {
        touchending = null;
      }, touchDelay);
      for (i = 0; i < n; ++i) {
        t2 = touches[i];
        if (g.touch0 && g.touch0[2] === t2.identifier) delete g.touch0;
        else if (g.touch1 && g.touch1[2] === t2.identifier) delete g.touch1;
      }
      if (g.touch1 && !g.touch0) g.touch0 = g.touch1, delete g.touch1;
      if (g.touch0) g.touch0[1] = this.__zoom.invert(g.touch0[0]);
      else {
        g.end();
        if (g.taps === 2) {
          t2 = pointer_default(t2, this);
          if (Math.hypot(touchfirst[0] - t2[0], touchfirst[1] - t2[1]) < tapDistance) {
            var p = select_default2(this).on("dblclick.zoom");
            if (p) p.apply(this, arguments);
          }
        }
      }
    }
    zoom.wheelDelta = function(_) {
      return arguments.length ? (wheelDelta = typeof _ === "function" ? _ : constant_default3(+_), zoom) : wheelDelta;
    };
    zoom.filter = function(_) {
      return arguments.length ? (filter2 = typeof _ === "function" ? _ : constant_default3(!!_), zoom) : filter2;
    };
    zoom.touchable = function(_) {
      return arguments.length ? (touchable = typeof _ === "function" ? _ : constant_default3(!!_), zoom) : touchable;
    };
    zoom.extent = function(_) {
      return arguments.length ? (extent = typeof _ === "function" ? _ : constant_default3([[+_[0][0], +_[0][1]], [+_[1][0], +_[1][1]]]), zoom) : extent;
    };
    zoom.scaleExtent = function(_) {
      return arguments.length ? (scaleExtent[0] = +_[0], scaleExtent[1] = +_[1], zoom) : [scaleExtent[0], scaleExtent[1]];
    };
    zoom.translateExtent = function(_) {
      return arguments.length ? (translateExtent[0][0] = +_[0][0], translateExtent[1][0] = +_[1][0], translateExtent[0][1] = +_[0][1], translateExtent[1][1] = +_[1][1], zoom) : [[translateExtent[0][0], translateExtent[0][1]], [translateExtent[1][0], translateExtent[1][1]]];
    };
    zoom.constrain = function(_) {
      return arguments.length ? (constrain = _, zoom) : constrain;
    };
    zoom.duration = function(_) {
      return arguments.length ? (duration = +_, zoom) : duration;
    };
    zoom.interpolate = function(_) {
      return arguments.length ? (interpolate = _, zoom) : interpolate;
    };
    zoom.on = function() {
      var value = listeners.on.apply(listeners, arguments);
      return value === listeners ? zoom : value;
    };
    zoom.clickDistance = function(_) {
      return arguments.length ? (clickDistance2 = (_ = +_) * _, zoom) : Math.sqrt(clickDistance2);
    };
    zoom.tapDistance = function(_) {
      return arguments.length ? (tapDistance = +_, zoom) : tapDistance;
    };
    return zoom;
  }

  // src/data/world.json
  var world_default = { type: "FeatureCollection", meta: { источник: "Natural Earth 1:110m admin_0_countries", лицензия: "public domain (naturalearthdata.com/about/terms-of-use)", подготовлено: "2026-08-17", упрощение: "координаты округлены до 2 знаков, Антарктида убрана" }, features: [{ type: "Feature", properties: { iso3: "FJI", имя: "Фиджи", имя_en: "Fiji", регион: "Melanesia", континент: "Oceania" }, geometry: { type: "MultiPolygon", coordinates: [[[[180, -16.07], [180, -16.56], [179.36, -16.8], [178.73, -17.01], [178.6, -16.64], [179.1, -16.43], [179.41, -16.38], [180, -16.07]]], [[[178.13, -17.5], [178.37, -17.34], [178.72, -17.63], [178.55, -18.15], [177.93, -18.29], [177.38, -18.16], [177.29, -17.72], [177.67, -17.38], [178.13, -17.5]]], [[[-179.79, -16.02], [-179.92, -16.5], [-180, -16.56], [-180, -16.07], [-179.79, -16.02]]]] } }, { type: "Feature", properties: { iso3: "TZA", имя: "Танзания", имя_en: "Tanzania", регион: "Eastern Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[33.9, -0.95], [34.07, -1.06], [37.7, -3.1], [37.77, -3.68], [39.2, -4.68], [38.74, -5.91], [38.8, -6.48], [39.44, -6.84], [39.47, -7.1], [39.19, -7.7], [39.25, -8.01], [39.19, -8.49], [39.54, -9.11], [39.95, -10.1], [40.32, -10.32], [40.32, -10.32], [39.52, -10.9], [38.43, -11.29], [37.83, -11.27], [37.47, -11.57], [36.78, -11.59], [36.51, -11.72], [35.31, -11.44], [34.56, -11.52], [34.28, -10.16], [33.94, -9.69], [33.74, -9.42], [32.76, -9.23], [32.19, -8.93], [31.56, -8.76], [31.16, -8.59], [30.74, -8.34], [30.74, -8.34], [30.2, -7.08], [29.62, -6.52], [29.42, -5.94], [29.52, -5.42], [29.34, -4.5], [29.75, -4.45], [30.12, -4.09], [30.51, -3.57], [30.75, -3.36], [30.74, -3.03], [30.53, -2.81], [30.47, -2.41], [30.47, -2.41], [30.76, -2.29], [30.82, -1.7], [30.42, -1.13], [30.77, -1.01], [31.87, -1.03], [33.9, -0.95]]] } }, { type: "Feature", properties: { iso3: "ESH", имя: "Западная Сахара", имя_en: "W. Sahara", регион: "Northern Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[-8.67, 27.66], [-8.67, 27.59], [-8.68, 27.4], [-8.69, 25.88], [-11.97, 25.93], [-11.94, 23.37], [-12.87, 23.28], [-13.12, 22.77], [-12.93, 21.33], [-16.85, 21.33], [-17.06, 21], [-17.02, 21.42], [-17, 21.42], [-14.75, 21.5], [-14.63, 21.86], [-14.22, 22.31], [-13.89, 23.69], [-12.5, 24.77], [-12.03, 26.03], [-11.72, 26.1], [-11.39, 26.88], [-10.55, 26.99], [-10.19, 26.86], [-9.74, 26.86], [-9.41, 27.09], [-8.79, 27.12], [-8.82, 27.66], [-8.67, 27.66]]] } }, { type: "Feature", properties: { iso3: "CAN", имя: "Канада", имя_en: "Canada", регион: "Northern America", континент: "North America" }, geometry: { type: "MultiPolygon", coordinates: [[[[-122.84, 49], [-122.97, 49], [-124.91, 49.98], [-125.62, 50.42], [-127.44, 50.83], [-127.99, 51.72], [-127.85, 52.33], [-129.13, 52.76], [-129.31, 53.56], [-130.51, 54.29], [-130.54, 54.8], [-130.54, 54.8], [-129.98, 55.28], [-130.01, 55.92], [-131.71, 56.55], [-132.73, 57.69], [-133.36, 58.41], [-134.27, 58.86], [-134.94, 59.27], [-135.48, 59.79], [-136.48, 59.46], [-137.45, 58.91], [-138.34, 59.56], [-139.04, 60], [-140.01, 60.28], [-141, 60.31], [-140.99, 66], [-140.99, 69.71], [-140.99, 69.71], [-139.12, 69.47], [-137.55, 68.99], [-136.5, 68.9], [-135.63, 69.32], [-134.41, 69.63], [-132.93, 69.51], [-131.43, 69.94], [-129.79, 70.19], [-129.11, 69.78], [-128.36, 70.01], [-128.14, 70.48], [-127.45, 70.38], [-125.76, 69.48], [-124.42, 70.16], [-124.29, 69.4], [-123.06, 69.56], [-122.68, 69.86], [-121.47, 69.8], [-119.94, 69.38], [-117.6, 69.01], [-116.23, 68.84], [-115.25, 68.91], [-113.9, 68.4], [-115.3, 67.9], [-113.5, 67.69], [-110.8, 67.81], [-109.95, 67.98], [-108.88, 67.38], [-107.79, 67.89], [-108.81, 68.31], [-108.17, 68.65], [-106.95, 68.7], [-106.15, 68.8], [-105.34, 68.56], [-104.34, 68.02], [-103.22, 68.1], [-101.45, 67.65], [-99.9, 67.81], [-98.44, 67.78], [-98.56, 68.4], [-97.67, 68.58], [-96.12, 68.24], [-96.13, 67.29], [-95.49, 68.09], [-94.69, 68.06], [-94.23, 69.07], [-95.3, 69.69], [-96.47, 70.09], [-96.39, 71.19], [-95.21, 71.92], [-93.89, 71.76], [-92.88, 71.32], [-91.52, 70.19], [-92.41, 69.7], [-90.55, 69.5], [-90.55, 68.47], [-89.22, 69.26], [-88.02, 68.62], [-88.32, 67.87], [-87.35, 67.2], [-86.31, 67.92], [-85.58, 68.78], [-85.52, 69.88], [-84.1, 69.81], [-82.62, 69.66], [-81.28, 69.16], [-81.22, 68.67], [-81.96, 68.13], [-81.26, 67.6], [-81.39, 67.11], [-83.34, 66.41], [-84.74, 66.26], [-85.77, 66.56], [-86.07, 66.06], [-87.03, 65.21], [-87.32, 64.78], [-88.48, 64.1], [-89.91, 64.03], [-90.7, 63.61], [-90.77, 62.96], [-91.93, 62.84], [-93.16, 62.02], [-94.24, 60.9], [-94.63, 60.11], [-94.68, 58.95], [-93.22, 58.78], [-92.76, 57.85], [-92.3, 57.09], [-90.9, 57.28], [-89.04, 56.85], [-88.04, 56.47], [-87.32, 56], [-86.07, 55.72], [-85.01, 55.3], [-83.36, 55.24], [-82.27, 55.15], [-82.44, 54.28], [-82.13, 53.28], [-81.4, 52.16], [-79.91, 51.21], [-79.14, 51.53], [-78.6, 52.56], [-79.12, 54.14], [-79.83, 54.67], [-78.23, 55.14], [-77.1, 55.84], [-76.54, 56.53], [-76.62, 57.2], [-77.3, 58.05], [-78.52, 58.8], [-77.34, 59.85], [-77.77, 60.76], [-78.11, 62.32], [-77.41, 62.55], [-75.7, 62.28], [-74.67, 62.18], [-73.84, 62.44], [-72.91, 62.11], [-71.68, 61.53], [-71.37, 61.14], [-69.59, 61.06], [-69.62, 60.22], [-69.29, 58.96], [-68.37, 58.8], [-67.65, 58.21], [-66.2, 58.77], [-65.25, 59.87], [-64.58, 60.34], [-63.8, 59.44], [-62.5, 58.17], [-61.4, 56.97], [-61.8, 56.34], [-60.47, 55.78], [-59.57, 55.2], [-57.98, 54.95], [-57.33, 54.63], [-56.94, 53.78], [-56.16, 53.65], [-55.76, 53.27], [-55.68, 52.15], [-56.41, 51.77], [-57.13, 51.42], [-58.77, 51.06], [-60.03, 50.24], [-61.72, 50.08], [-63.86, 50.29], [-65.36, 50.3], [-66.4, 50.23], [-67.24, 49.51], [-68.51, 49.07], [-69.95, 47.74], [-71.1, 46.82], [-70.26, 46.99], [-68.65, 48.3], [-66.55, 49.13], [-65.06, 49.23], [-64.17, 48.74], [-65.12, 48.07], [-64.8, 46.99], [-64.47, 46.24], [-63.17, 45.74], [-61.52, 45.88], [-60.52, 47.01], [-60.45, 46.28], [-59.8, 45.92], [-61.04, 45.27], [-63.25, 44.67], [-64.25, 44.27], [-65.36, 43.55], [-66.12, 43.62], [-66.16, 44.47], [-64.43, 45.29], [-66.03, 45.26], [-67.14, 45.14], [-67.79, 45.7], [-67.79, 47.07], [-68.23, 47.35], [-68.91, 47.19], [-69.24, 47.45], [-70, 46.69], [-70.31, 45.91], [-70.66, 45.46], [-71.08, 45.31], [-71.41, 45.26], [-71.51, 45.01], [-73.35, 45.01], [-74.87, 45], [-75.32, 44.82], [-76.38, 44.1], [-76.5, 44.02], [-76.82, 43.63], [-77.74, 43.63], [-78.72, 43.63], [-79.17, 43.47], [-79.01, 43.27], [-78.92, 42.97], [-78.94, 42.86], [-80.25, 42.37], [-81.28, 42.21], [-82.44, 41.68], [-82.69, 41.68], [-83.03, 41.83], [-83.14, 41.98], [-83.12, 42.08], [-82.9, 42.43], [-82.43, 42.98], [-82.14, 43.57], [-82.34, 44.44], [-82.55, 45.35], [-83.59, 45.82], [-83.47, 45.99], [-83.62, 46.12], [-83.89, 46.12], [-84.09, 46.28], [-84.14, 46.51], [-84.34, 46.41], [-84.6, 46.44], [-84.54, 46.54], [-84.78, 46.64], [-84.88, 46.9], [-85.65, 47.22], [-86.46, 47.55], [-87.44, 47.94], [-88.38, 48.3], [-89.27, 48.02], [-89.6, 48.01], [-90.83, 48.27], [-91.64, 48.14], [-92.61, 48.45], [-93.63, 48.61], [-94.33, 48.67], [-94.64, 48.84], [-94.82, 49.39], [-95.16, 49.38], [-95.16, 49], [-97.23, 49], [-100.65, 49], [-104.05, 49], [-107.05, 49], [-110.05, 49], [-113, 49], [-116.05, 49], [-117.03, 49], [-120, 49], [-122.84, 49]]], [[[-83.99, 62.45], [-83.25, 62.91], [-81.88, 62.9], [-81.9, 62.71], [-83.07, 62.16], [-83.77, 62.18], [-83.99, 62.45]]], [[[-79.78, 72.8], [-80.88, 73.33], [-80.83, 73.69], [-80.35, 73.76], [-78.06, 73.65], [-76.34, 73.1], [-76.25, 72.83], [-77.31, 72.86], [-78.39, 72.88], [-79.49, 72.74], [-79.78, 72.8]]], [[[-80.32, 62.09], [-79.93, 62.39], [-79.52, 62.36], [-79.27, 62.16], [-79.66, 61.63], [-80.1, 61.72], [-80.36, 62.02], [-80.32, 62.09]]], [[[-93.61, 74.98], [-94.16, 74.59], [-95.61, 74.67], [-96.82, 74.93], [-96.29, 75.38], [-94.85, 75.65], [-93.98, 75.3], [-93.61, 74.98]]], [[[-93.84, 77.52], [-94.3, 77.49], [-96.17, 77.56], [-96.44, 77.83], [-94.42, 77.82], [-93.72, 77.63], [-93.84, 77.52]]], [[[-96.75, 78.77], [-95.56, 78.42], [-95.83, 78.06], [-97.31, 77.85], [-98.12, 78.08], [-98.55, 78.46], [-98.63, 78.87], [-97.34, 78.83], [-96.75, 78.77]]], [[[-88.15, 74.39], [-89.76, 74.52], [-92.42, 74.84], [-92.77, 75.39], [-92.89, 75.88], [-93.89, 76.32], [-95.96, 76.44], [-97.12, 76.75], [-96.75, 77.16], [-94.68, 77.1], [-93.57, 76.78], [-91.61, 76.78], [-90.74, 76.45], [-90.97, 76.07], [-89.82, 75.85], [-89.19, 75.61], [-87.84, 75.57], [-86.38, 75.48], [-84.79, 75.7], [-82.75, 75.78], [-81.13, 75.71], [-80.06, 75.34], [-79.83, 74.92], [-80.46, 74.66], [-81.95, 74.44], [-83.23, 74.56], [-86.1, 74.41], [-88.15, 74.39]]], [[[-111.26, 78.15], [-109.85, 78], [-110.19, 77.7], [-112.05, 77.41], [-113.53, 77.73], [-112.72, 78.05], [-111.26, 78.15]]], [[[-110.96, 78.8], [-109.66, 78.6], [-110.88, 78.41], [-112.54, 78.41], [-112.53, 78.55], [-111.5, 78.85], [-110.96, 78.8]]], [[[-55.6, 51.32], [-56.13, 50.69], [-56.8, 49.81], [-56.14, 50.15], [-55.47, 49.94], [-55.82, 49.59], [-54.94, 49.31], [-54.47, 49.56], [-53.48, 49.25], [-53.79, 48.52], [-53.09, 48.69], [-52.96, 48.16], [-52.65, 47.54], [-53.07, 46.66], [-53.52, 46.62], [-54.18, 46.81], [-53.96, 47.63], [-54.24, 47.75], [-55.4, 46.88], [-56, 46.92], [-55.29, 47.39], [-56.25, 47.63], [-57.33, 47.57], [-59.27, 47.6], [-59.42, 47.9], [-58.8, 48.25], [-59.23, 48.52], [-58.39, 49.13], [-57.36, 50.72], [-56.74, 51.29], [-55.87, 51.63], [-55.41, 51.59], [-55.6, 51.32]]], [[[-83.88, 65.11], [-82.79, 64.77], [-81.64, 64.46], [-81.55, 63.98], [-80.82, 64.06], [-80.1, 63.73], [-80.99, 63.41], [-82.55, 63.65], [-83.11, 64.1], [-84.1, 63.57], [-85.52, 63.05], [-85.87, 63.64], [-87.22, 63.54], [-86.35, 64.04], [-86.22, 64.82], [-85.88, 65.74], [-85.16, 65.66], [-84.98, 65.22], [-84.46, 65.37], [-83.88, 65.11]]], [[[-78.77, 72.35], [-77.82, 72.75], [-75.61, 72.24], [-74.23, 71.77], [-74.1, 71.33], [-72.24, 71.56], [-71.2, 70.92], [-68.79, 70.53], [-67.91, 70.12], [-66.97, 69.19], [-68.81, 68.72], [-66.45, 68.07], [-64.86, 67.85], [-63.42, 66.93], [-61.85, 66.86], [-62.16, 66.16], [-63.92, 65], [-65.15, 65.43], [-66.72, 66.39], [-68.02, 66.26], [-68.14, 65.69], [-67.09, 65.11], [-65.73, 64.65], [-65.32, 64.38], [-64.67, 63.39], [-65.01, 62.67], [-66.28, 62.95], [-68.78, 63.75], [-67.37, 62.88], [-66.33, 62.28], [-66.17, 61.93], [-68.88, 62.33], [-71.02, 62.91], [-72.24, 63.4], [-71.89, 63.68], [-73.38, 64.19], [-74.83, 64.68], [-74.82, 64.39], [-77.71, 64.23], [-78.56, 64.57], [-77.9, 65.31], [-76.02, 65.33], [-73.96, 65.45], [-74.29, 65.81], [-73.94, 66.31], [-72.65, 67.28], [-72.93, 67.73], [-73.31, 68.07], [-74.84, 68.55], [-76.87, 68.89], [-76.23, 69.15], [-77.29, 69.77], [-78.17, 69.83], [-78.96, 70.17], [-79.49, 69.87], [-81.31, 69.74], [-84.94, 69.97], [-87.06, 70.26], [-88.68, 70.41], [-89.51, 70.76], [-88.47, 71.22], [-89.89, 71.22], [-90.21, 72.24], [-89.44, 73.13], [-88.41, 73.54], [-85.83, 73.8], [-86.56, 73.16], [-85.77, 72.53], [-84.85, 73.34], [-82.32, 73.75], [-80.6, 72.72], [-80.75, 72.06], [-78.77, 72.35]]], [[[-94.5, 74.13], [-92.42, 74.1], [-90.51, 73.86], [-92, 72.97], [-93.2, 72.77], [-94.27, 72.02], [-95.41, 72.06], [-96.03, 72.94], [-96.02, 73.44], [-95.5, 73.86], [-94.5, 74.13]]], [[[-122.85, 76.12], [-122.85, 76.12], [-121.16, 76.86], [-119.1, 77.51], [-117.57, 77.5], [-116.2, 77.65], [-116.34, 76.88], [-117.11, 76.53], [-118.04, 76.48], [-119.9, 76.05], [-121.5, 75.9], [-122.85, 76.12]]], [[[-132.71, 54.04], [-131.75, 54.12], [-132.05, 52.98], [-131.18, 52.18], [-131.58, 52.18], [-132.18, 52.64], [-132.55, 53.1], [-133.05, 53.41], [-133.24, 53.85], [-133.18, 54.17], [-132.71, 54.04]]], [[[-105.49, 79.3], [-103.53, 79.17], [-100.83, 78.8], [-100.06, 78.32], [-99.67, 77.91], [-101.3, 78.02], [-102.95, 78.34], [-105.18, 78.38], [-104.21, 78.68], [-105.42, 78.92], [-105.49, 79.3]]], [[[-123.51, 48.51], [-124.01, 48.37], [-125.66, 48.83], [-125.95, 49.18], [-126.85, 49.53], [-127.03, 49.81], [-128.06, 49.99], [-128.44, 50.54], [-128.36, 50.77], [-127.31, 50.55], [-126.7, 50.4], [-125.76, 50.3], [-125.42, 49.95], [-124.92, 49.48], [-123.92, 49.06], [-123.51, 48.51]]], [[[-121.54, 74.45], [-120.11, 74.24], [-117.56, 74.19], [-116.58, 73.9], [-115.51, 73.48], [-116.77, 73.22], [-119.22, 72.52], [-120.46, 71.82], [-120.46, 71.38], [-123.09, 70.9], [-123.62, 71.34], [-125.93, 71.87], [-125.5, 72.29], [-124.81, 73.02], [-123.94, 73.68], [-124.92, 74.29], [-121.54, 74.45]]], [[[-107.82, 75.85], [-106.93, 76.01], [-105.88, 75.97], [-105.7, 75.48], [-106.31, 75.01], [-109.7, 74.85], [-112.22, 74.42], [-113.74, 74.39], [-113.87, 74.72], [-111.79, 75.16], [-116.31, 75.04], [-117.71, 75.22], [-116.35, 76.2], [-115.4, 76.48], [-112.59, 76.14], [-110.81, 75.55], [-109.07, 75.47], [-110.5, 76.43], [-109.58, 76.79], [-108.55, 76.68], [-108.21, 76.2], [-107.82, 75.85]]], [[[-106.52, 73.08], [-105.4, 72.67], [-104.77, 71.7], [-104.46, 70.99], [-102.79, 70.5], [-100.98, 70.02], [-101.09, 69.58], [-102.73, 69.5], [-102.09, 69.12], [-102.43, 68.75], [-104.24, 68.91], [-105.96, 69.18], [-107.12, 69.12], [-109, 68.78], [-111.53, 68.63], [-113.31, 68.54], [-113.85, 69.01], [-115.22, 69.28], [-116.11, 69.17], [-117.34, 69.96], [-116.67, 70.07], [-115.13, 70.24], [-113.72, 70.19], [-112.42, 70.37], [-114.35, 70.6], [-116.49, 70.52], [-117.9, 70.54], [-118.43, 70.91], [-116.11, 71.31], [-117.66, 71.3], [-119.4, 71.56], [-118.56, 72.31], [-117.87, 72.71], [-115.19, 73.31], [-114.17, 73.12], [-114.67, 72.65], [-112.44, 72.96], [-111.05, 72.45], [-109.92, 72.96], [-109.01, 72.63], [-108.19, 71.65], [-107.69, 72.07], [-108.4, 73.09], [-107.52, 73.24], [-106.52, 73.08]]], [[[-100.44, 72.71], [-101.54, 73.36], [-100.36, 73.84], [-99.16, 73.63], [-97.38, 73.76], [-97.12, 73.47], [-98.05, 72.99], [-96.54, 72.56], [-96.72, 71.66], [-98.36, 71.27], [-99.32, 71.36], [-100.01, 71.74], [-102.5, 72.51], [-102.48, 72.83], [-100.44, 72.71]]], [[[-106.6, 73.6], [-105.26, 73.64], [-104.5, 73.42], [-105.38, 72.76], [-106.94, 73.46], [-106.6, 73.6]]], [[[-98.5, 76.72], [-97.74, 76.26], [-97.7, 75.74], [-98.16, 75], [-99.81, 74.9], [-100.88, 75.06], [-100.86, 75.64], [-102.5, 75.56], [-102.57, 76.34], [-101.49, 76.31], [-99.98, 76.65], [-98.58, 76.59], [-98.5, 76.72]]], [[[-96.02, 80.6], [-95.32, 80.91], [-94.3, 80.98], [-94.74, 81.21], [-92.41, 81.26], [-91.13, 80.72], [-89.45, 80.51], [-87.81, 80.32], [-87.02, 79.66], [-85.81, 79.34], [-87.19, 79.04], [-89.04, 78.29], [-90.8, 78.22], [-92.88, 78.34], [-93.95, 78.75], [-93.94, 79.11], [-93.15, 79.38], [-94.97, 79.37], [-96.08, 79.71], [-96.71, 80.16], [-96.02, 80.6]]], [[[-91.59, 81.89], [-90.1, 82.08], [-88.93, 82.12], [-86.97, 82.28], [-85.5, 82.65], [-84.26, 82.6], [-83.18, 82.32], [-82.42, 82.86], [-81.1, 83.02], [-79.31, 83.13], [-76.25, 83.17], [-75.72, 83.06], [-72.83, 83.23], [-70.67, 83.17], [-68.5, 83.11], [-65.83, 83.03], [-63.68, 82.9], [-61.85, 82.63], [-61.89, 82.36], [-64.33, 81.93], [-66.75, 81.73], [-67.66, 81.5], [-65.48, 81.51], [-67.84, 80.9], [-69.47, 80.62], [-71.18, 79.8], [-73.24, 79.63], [-73.88, 79.43], [-76.91, 79.32], [-75.53, 79.2], [-76.22, 79.02], [-75.39, 78.53], [-76.34, 78.18], [-77.89, 77.9], [-78.36, 77.51], [-79.76, 77.21], [-79.62, 76.98], [-77.91, 77.02], [-77.89, 76.78], [-80.56, 76.18], [-83.17, 76.45], [-86.11, 76.3], [-87.6, 76.42], [-89.49, 76.47], [-89.62, 76.95], [-87.77, 77.18], [-88.26, 77.9], [-87.65, 77.97], [-84.98, 77.54], [-86.34, 78.18], [-87.96, 78.37], [-87.15, 78.76], [-85.38, 79], [-85.09, 79.35], [-86.51, 79.74], [-86.93, 80.25], [-84.2, 80.21], [-83.41, 80.1], [-81.85, 80.46], [-84.1, 80.58], [-87.6, 80.52], [-89.37, 80.86], [-90.2, 81.26], [-91.37, 81.55], [-91.59, 81.89]]], [[[-75.22, 67.44], [-75.87, 67.15], [-76.99, 67.1], [-77.24, 67.59], [-76.81, 68.15], [-75.9, 68.29], [-75.11, 68.01], [-75.1, 67.58], [-75.22, 67.44]]], [[[-96.26, 69.49], [-95.65, 69.11], [-96.27, 68.76], [-97.62, 69.06], [-98.43, 68.95], [-99.8, 69.4], [-98.92, 69.71], [-98.22, 70.14], [-97.16, 69.86], [-96.56, 69.68], [-96.26, 69.49]]], [[[-64.52, 49.87], [-64.17, 49.96], [-62.86, 49.71], [-61.84, 49.29], [-61.81, 49.11], [-62.29, 49.09], [-63.59, 49.4], [-64.52, 49.87]]], [[[-64.01, 47.04], [-63.66, 46.55], [-62.94, 46.42], [-62.01, 46.44], [-62.5, 46.03], [-62.87, 45.97], [-64.14, 46.39], [-64.39, 46.73], [-64.01, 47.04]]]] } }, { type: "Feature", properties: { iso3: "USA", имя: "США", имя_en: "United States of America", регион: "Northern America", континент: "North America" }, geometry: { type: "MultiPolygon", coordinates: [[[[-122.84, 49], [-120, 49], [-117.03, 49], [-116.05, 49], [-113, 49], [-110.05, 49], [-107.05, 49], [-104.05, 49], [-100.65, 49], [-97.23, 49], [-95.16, 49], [-95.16, 49.38], [-94.82, 49.39], [-94.64, 48.84], [-94.33, 48.67], [-93.63, 48.61], [-92.61, 48.45], [-91.64, 48.14], [-90.83, 48.27], [-89.6, 48.01], [-89.27, 48.02], [-88.38, 48.3], [-87.44, 47.94], [-86.46, 47.55], [-85.65, 47.22], [-84.88, 46.9], [-84.78, 46.64], [-84.54, 46.54], [-84.6, 46.44], [-84.34, 46.41], [-84.14, 46.51], [-84.09, 46.28], [-83.89, 46.12], [-83.62, 46.12], [-83.47, 45.99], [-83.59, 45.82], [-82.55, 45.35], [-82.34, 44.44], [-82.14, 43.57], [-82.43, 42.98], [-82.9, 42.43], [-83.12, 42.08], [-83.14, 41.98], [-83.03, 41.83], [-82.69, 41.68], [-82.44, 41.68], [-81.28, 42.21], [-80.25, 42.37], [-78.94, 42.86], [-78.92, 42.97], [-79.01, 43.27], [-79.17, 43.47], [-78.72, 43.63], [-77.74, 43.63], [-76.82, 43.63], [-76.5, 44.02], [-76.38, 44.1], [-75.32, 44.82], [-74.87, 45], [-73.35, 45.01], [-71.51, 45.01], [-71.41, 45.26], [-71.08, 45.31], [-70.66, 45.46], [-70.31, 45.91], [-70, 46.69], [-69.24, 47.45], [-68.91, 47.19], [-68.23, 47.35], [-67.79, 47.07], [-67.79, 45.7], [-67.14, 45.14], [-66.96, 44.81], [-68.03, 44.33], [-69.06, 43.98], [-70.12, 43.68], [-70.65, 43.09], [-70.81, 42.87], [-70.83, 42.34], [-70.5, 41.8], [-70.08, 41.78], [-70.19, 42.15], [-69.88, 41.92], [-69.97, 41.64], [-70.64, 41.48], [-71.12, 41.49], [-71.86, 41.32], [-72.3, 41.27], [-72.88, 41.22], [-73.71, 40.93], [-72.24, 41.12], [-71.94, 40.93], [-73.34, 40.63], [-73.98, 40.63], [-73.95, 40.75], [-74.26, 40.47], [-73.96, 40.43], [-74.18, 39.71], [-74.91, 38.94], [-74.98, 39.2], [-75.2, 39.25], [-75.53, 39.5], [-75.32, 38.96], [-75.07, 38.78], [-75.06, 38.4], [-75.38, 38.02], [-75.94, 37.22], [-76.03, 37.26], [-75.72, 37.94], [-76.23, 38.32], [-76.35, 39.15], [-76.54, 38.72], [-76.33, 38.08], [-76.99, 38.24], [-76.3, 37.92], [-76.26, 36.97], [-75.97, 36.9], [-75.87, 36.55], [-75.73, 35.55], [-76.36, 34.81], [-77.4, 34.51], [-78.05, 33.93], [-78.55, 33.86], [-79.06, 33.49], [-79.2, 33.16], [-80.3, 32.51], [-80.86, 32.03], [-81.34, 31.44], [-81.49, 30.73], [-81.31, 30.04], [-80.98, 29.18], [-80.54, 28.47], [-80.53, 28.04], [-80.06, 26.88], [-80.09, 26.21], [-80.13, 25.82], [-80.38, 25.21], [-80.68, 25.08], [-81.17, 25.2], [-81.33, 25.64], [-81.71, 25.87], [-82.24, 26.73], [-82.71, 27.5], [-82.86, 27.89], [-82.65, 28.55], [-82.93, 29.1], [-83.71, 29.94], [-84.1, 30.09], [-85.11, 29.64], [-85.29, 29.69], [-85.77, 30.15], [-86.4, 30.4], [-87.53, 30.27], [-88.42, 30.38], [-89.18, 30.32], [-89.59, 30.16], [-89.41, 29.89], [-89.43, 29.49], [-89.22, 29.29], [-89.41, 29.16], [-89.78, 29.31], [-90.15, 29.12], [-90.88, 29.15], [-91.63, 29.68], [-92.5, 29.55], [-93.23, 29.78], [-93.85, 29.71], [-94.69, 29.48], [-95.6, 28.74], [-96.59, 28.31], [-97.14, 27.83], [-97.37, 27.38], [-97.38, 26.69], [-97.33, 26.21], [-97.14, 25.87], [-97.53, 25.84], [-98.24, 26.06], [-99.02, 26.37], [-99.3, 26.84], [-99.52, 27.54], [-100.11, 28.11], [-100.46, 28.7], [-100.96, 29.38], [-101.66, 29.78], [-102.48, 29.76], [-103.11, 28.97], [-103.94, 29.27], [-104.46, 29.57], [-104.71, 30.12], [-105.04, 30.64], [-105.63, 31.08], [-106.14, 31.4], [-106.51, 31.75], [-108.24, 31.75], [-108.24, 31.34], [-109.03, 31.34], [-111.02, 31.33], [-113.3, 32.04], [-114.81, 32.53], [-114.72, 32.72], [-115.99, 32.61], [-117.13, 32.54], [-117.3, 33.05], [-117.94, 33.62], [-118.41, 33.74], [-118.52, 34.03], [-119.08, 34.08], [-119.44, 34.35], [-120.37, 34.45], [-120.62, 34.61], [-120.74, 35.16], [-121.71, 36.16], [-122.55, 37.55], [-122.51, 37.78], [-122.95, 38.11], [-123.73, 38.95], [-123.87, 39.77], [-124.4, 40.31], [-124.18, 41.14], [-124.21, 42], [-124.53, 42.77], [-124.14, 43.71], [-124.02, 44.62], [-123.9, 45.52], [-124.08, 46.86], [-124.4, 47.72], [-124.69, 48.18], [-124.57, 48.38], [-123.12, 48.04], [-122.59, 47.1], [-122.34, 47.36], [-122.5, 48.18], [-122.84, 49]]], [[[-155.4, 20.08], [-155.22, 19.99], [-155.06, 19.86], [-154.81, 19.51], [-154.83, 19.45], [-155.22, 19.24], [-155.54, 19.08], [-155.69, 18.92], [-155.94, 19.06], [-155.91, 19.34], [-156.07, 19.7], [-156.02, 19.81], [-155.85, 19.98], [-155.92, 20.17], [-155.86, 20.27], [-155.79, 20.25], [-155.4, 20.08]]], [[[-156, 20.76], [-156.08, 20.64], [-156.41, 20.57], [-156.59, 20.78], [-156.7, 20.86], [-156.71, 20.93], [-156.61, 21.01], [-156.26, 20.92], [-156, 20.76]]], [[[-156.76, 21.18], [-156.79, 21.07], [-157.33, 21.1], [-157.25, 21.22], [-156.76, 21.18]]], [[[-158.03, 21.72], [-157.94, 21.65], [-157.65, 21.32], [-157.71, 21.26], [-157.78, 21.28], [-158.13, 21.31], [-158.25, 21.54], [-158.29, 21.58], [-158.03, 21.72]]], [[[-159.37, 22.21], [-159.35, 21.98], [-159.46, 21.88], [-159.8, 22.07], [-159.75, 22.14], [-159.6, 22.24], [-159.37, 22.21]]], [[[-166.47, 60.38], [-165.67, 60.29], [-165.58, 59.91], [-166.19, 59.75], [-166.85, 59.94], [-167.46, 60.21], [-166.47, 60.38]]], [[[-153.23, 57.97], [-152.56, 57.9], [-152.14, 57.59], [-153.01, 57.12], [-154.01, 56.73], [-154.52, 56.99], [-154.67, 57.46], [-153.76, 57.82], [-153.23, 57.97]]], [[[-140.99, 69.71], [-140.99, 69.71], [-140.99, 66], [-141, 60.31], [-140.01, 60.28], [-139.04, 60], [-138.34, 59.56], [-137.45, 58.91], [-136.48, 59.46], [-135.48, 59.79], [-134.94, 59.27], [-134.27, 58.86], [-133.36, 58.41], [-132.73, 57.69], [-131.71, 56.55], [-130.01, 55.92], [-129.98, 55.28], [-130.54, 54.8], [-130.54, 54.8], [-130.54, 54.8], [-131.09, 55.18], [-131.97, 55.5], [-132.25, 56.37], [-133.54, 57.18], [-134.08, 58.12], [-135.04, 58.19], [-136.63, 58.21], [-137.8, 58.5], [-139.87, 59.54], [-140.83, 59.73], [-142.57, 60.08], [-143.96, 60], [-145.93, 60.46], [-147.11, 60.88], [-148.22, 60.67], [-148.02, 59.98], [-148.57, 59.91], [-149.73, 59.71], [-150.61, 59.37], [-151.72, 59.16], [-151.86, 59.74], [-151.41, 60.73], [-150.35, 61.03], [-150.62, 61.28], [-151.9, 60.73], [-152.58, 60.06], [-154.02, 59.35], [-153.29, 58.86], [-154.23, 58.15], [-155.31, 57.73], [-156.31, 57.42], [-156.56, 56.98], [-158.12, 56.46], [-158.43, 55.99], [-159.6, 55.57], [-160.29, 55.64], [-161.22, 55.36], [-162.24, 55.02], [-163.07, 54.69], [-164.79, 54.4], [-164.94, 54.57], [-163.85, 55.04], [-162.87, 55.35], [-161.8, 55.89], [-160.56, 56.01], [-160.07, 56.42], [-158.68, 57.02], [-158.46, 57.22], [-157.72, 57.57], [-157.55, 58.33], [-157.04, 58.92], [-158.19, 58.62], [-158.52, 58.79], [-159.06, 58.42], [-159.71, 58.93], [-159.98, 58.57], [-160.36, 59.07], [-161.36, 58.67], [-161.97, 58.67], [-162.05, 59.27], [-161.87, 59.63], [-162.52, 59.99], [-163.82, 59.8], [-164.66, 60.27], [-165.35, 60.51], [-165.35, 61.07], [-166.12, 61.5], [-165.73, 62.07], [-164.92, 62.63], [-164.56, 63.15], [-163.75, 63.22], [-163.07, 63.06], [-162.26, 63.54], [-161.53, 63.46], [-160.77, 63.77], [-160.96, 64.22], [-161.52, 64.4], [-160.78, 64.79], [-161.39, 64.78], [-162.45, 64.56], [-162.76, 64.34], [-163.55, 64.56], [-164.96, 64.45], [-166.43, 64.69], [-166.85, 65.09], [-168.11, 65.67], [-166.71, 66.09], [-164.47, 66.58], [-163.65, 66.58], [-163.79, 66.08], [-161.68, 66.12], [-162.49, 66.74], [-163.72, 67.12], [-164.43, 67.62], [-165.39, 68.04], [-166.76, 68.36], [-166.2, 68.88], [-164.43, 68.92], [-163.17, 69.37], [-162.93, 69.86], [-161.91, 70.33], [-160.93, 70.45], [-159.04, 70.89], [-158.12, 70.82], [-156.58, 71.36], [-155.07, 71.15], [-154.34, 70.7], [-153.9, 70.89], [-152.21, 70.83], [-152.27, 70.6], [-150.74, 70.43], [-149.72, 70.53], [-147.61, 70.21], [-145.69, 70.12], [-144.92, 69.99], [-143.59, 70.15], [-142.07, 69.85], [-140.99, 69.71], [-140.99, 69.71]]], [[[-171.73, 63.78], [-171.11, 63.59], [-170.49, 63.69], [-169.68, 63.43], [-168.69, 63.3], [-168.77, 63.19], [-169.53, 62.98], [-170.29, 63.19], [-170.67, 63.38], [-171.55, 63.32], [-171.79, 63.41], [-171.73, 63.78]]]] } }, { type: "Feature", properties: { iso3: "KAZ", имя: "Казахстан", имя_en: "Kazakhstan", регион: "Central Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[87.36, 49.21], [86.6, 48.55], [85.77, 48.46], [85.72, 47.45], [85.16, 47], [83.18, 47.33], [82.46, 45.54], [81.95, 45.32], [79.97, 44.92], [80.87, 43.18], [80.18, 42.92], [80.26, 42.35], [79.64, 42.5], [79.14, 42.86], [77.66, 42.96], [76, 42.99], [75.64, 42.88], [74.21, 43.3], [73.65, 43.09], [73.49, 42.5], [71.84, 42.85], [71.19, 42.7], [70.96, 42.27], [70.39, 42.08], [69.07, 41.38], [68.63, 40.67], [68.26, 40.66], [67.99, 41.14], [66.71, 41.17], [66.51, 41.99], [66.02, 41.99], [66.1, 43], [64.9, 43.73], [63.19, 43.65], [62.01, 43.5], [61.06, 44.41], [60.24, 44.78], [58.69, 45.5], [58.5, 45.59], [55.93, 45], [55.97, 41.31], [55.46, 41.26], [54.76, 42.04], [54.08, 42.32], [52.94, 42.12], [52.5, 41.78], [52.45, 42.03], [52.69, 42.44], [52.5, 42.79], [51.34, 43.13], [50.89, 44.03], [50.34, 44.28], [50.31, 44.61], [51.28, 44.51], [51.32, 45.25], [52.17, 45.41], [53.04, 45.26], [53.22, 46.23], [53.04, 46.85], [52.04, 46.8], [51.19, 47.05], [50.03, 46.61], [49.1, 46.4], [48.59, 46.56], [48.69, 47.08], [48.06, 47.74], [47.32, 47.72], [46.47, 48.39], [47.04, 49.15], [46.75, 49.36], [47.55, 50.45], [48.58, 49.87], [48.7, 50.61], [50.77, 51.69], [52.33, 51.72], [54.53, 51.03], [55.72, 50.62], [56.78, 51.04], [58.36, 51.06], [59.64, 50.55], [59.93, 50.84], [61.34, 50.8], [61.59, 51.27], [59.97, 51.96], [60.93, 52.45], [60.74, 52.72], [61.7, 52.98], [60.98, 53.66], [61.44, 54.01], [65.18, 54.35], [65.67, 54.6], [68.17, 54.97], [69.07, 55.39], [70.87, 55.17], [71.18, 54.13], [72.22, 54.38], [73.51, 54.04], [73.43, 53.49], [74.38, 53.55], [76.89, 54.49], [76.53, 54.18], [77.8, 53.4], [80.04, 50.86], [80.57, 51.39], [81.95, 50.81], [83.38, 51.07], [83.94, 50.89], [84.42, 50.31], [85.12, 50.12], [85.54, 49.69], [86.83, 49.83], [87.36, 49.21]]] } }, { type: "Feature", properties: { iso3: "UZB", имя: "Узбекистан", имя_en: "Uzbekistan", регион: "Central Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[55.97, 41.31], [55.93, 45], [58.5, 45.59], [58.69, 45.5], [60.24, 44.78], [61.06, 44.41], [62.01, 43.5], [63.19, 43.65], [64.9, 43.73], [66.1, 43], [66.02, 41.99], [66.51, 41.99], [66.71, 41.17], [67.99, 41.14], [68.26, 40.66], [68.63, 40.67], [69.07, 41.38], [70.39, 42.08], [70.96, 42.27], [71.26, 42.17], [70.42, 41.52], [71.16, 41.14], [71.87, 41.39], [73.06, 40.87], [71.77, 40.15], [71.01, 40.24], [70.6, 40.22], [70.46, 40.5], [70.67, 40.96], [69.33, 40.73], [69.01, 40.09], [68.54, 39.53], [67.7, 39.58], [67.44, 39.14], [68.18, 38.9], [68.39, 38.16], [67.83, 37.14], [67.08, 37.36], [66.52, 37.36], [66.55, 37.97], [65.22, 38.4], [64.17, 38.89], [63.52, 39.36], [62.37, 40.05], [61.88, 41.08], [61.55, 41.27], [60.47, 41.22], [60.08, 41.43], [59.98, 42.22], [58.63, 42.75], [57.79, 42.17], [56.93, 41.83], [57.1, 41.32], [55.97, 41.31]]] } }, { type: "Feature", properties: { iso3: "PNG", имя: "Папуа — Новая Гвинея", имя_en: "Papua New Guinea", регион: "Melanesia", континент: "Oceania" }, geometry: { type: "MultiPolygon", coordinates: [[[[141, -2.6], [142.74, -3.29], [144.58, -3.86], [145.27, -4.37], [145.83, -4.88], [145.98, -5.47], [147.65, -6.08], [147.89, -6.61], [146.97, -6.72], [147.19, -7.39], [148.08, -8.04], [148.73, -9.1], [149.31, -9.07], [149.27, -9.51], [150.04, -9.68], [149.74, -9.87], [150.8, -10.29], [150.69, -10.58], [150.03, -10.65], [149.78, -10.39], [148.92, -10.28], [147.91, -10.13], [147.14, -9.49], [146.57, -8.94], [146.05, -8.07], [144.74, -7.63], [143.9, -7.92], [143.29, -8.25], [143.41, -8.98], [142.63, -9.33], [142.07, -9.16], [141.03, -9.12], [141.02, -5.86], [141, -2.6]]], [[[152.64, -3.66], [153.02, -3.98], [153.14, -4.5], [152.83, -4.77], [152.64, -4.18], [152.41, -3.79], [151.95, -3.46], [151.38, -3.04], [150.66, -2.74], [150.94, -2.5], [151.48, -2.78], [151.82, -3], [152.24, -3.24], [152.64, -3.66]]], [[[151.3, -5.84], [150.75, -6.08], [150.24, -6.32], [149.71, -6.32], [148.89, -6.03], [148.32, -5.75], [148.4, -5.44], [149.3, -5.58], [149.85, -5.51], [150, -5.03], [150.14, -5], [150.24, -5.53], [150.81, -5.46], [151.09, -5.11], [151.65, -4.76], [151.54, -4.17], [152.14, -4.15], [152.34, -4.31], [152.32, -4.87], [151.98, -5.48], [151.46, -5.56], [151.3, -5.84]]], [[[154.76, -5.34], [155.06, -5.57], [155.55, -6.2], [156.02, -6.54], [155.88, -6.82], [155.6, -6.92], [155.17, -6.54], [154.73, -5.9], [154.51, -5.14], [154.65, -5.04], [154.76, -5.34]]]] } }, { type: "Feature", properties: { iso3: "IDN", имя: "Индонезия", имя_en: "Indonesia", регион: "South-Eastern Asia", континент: "Asia" }, geometry: { type: "MultiPolygon", coordinates: [[[[141, -2.6], [141.02, -5.86], [141.03, -9.12], [140.14, -8.3], [139.13, -8.1], [138.88, -8.38], [137.61, -8.41], [138.04, -7.6], [138.67, -7.32], [138.41, -6.23], [137.93, -5.39], [135.99, -4.55], [135.16, -4.46], [133.66, -3.54], [133.37, -4.02], [132.98, -4.11], [132.76, -3.75], [132.75, -3.31], [131.99, -2.82], [133.07, -2.46], [133.78, -2.48], [133.7, -2.21], [132.23, -2.21], [131.84, -1.62], [130.94, -1.43], [130.52, -0.94], [131.87, -0.7], [132.38, -0.37], [133.99, -0.78], [134.14, -1.15], [134.42, -2.77], [135.46, -3.37], [136.29, -2.31], [137.44, -1.7], [138.33, -1.7], [139.18, -2.05], [139.93, -2.41], [141, -2.6]]], [[[124.97, -8.89], [125.07, -9.09], [125.09, -9.39], [124.44, -10.14], [123.58, -10.36], [123.46, -10.24], [123.55, -9.9], [123.98, -9.29], [124.97, -8.89]]], [[[134.21, -6.9], [134.11, -6.14], [134.29, -5.78], [134.5, -5.45], [134.73, -5.74], [134.72, -6.21], [134.21, -6.9]]], [[[117.88, 4.14], [117.31, 3.23], [118.05, 2.29], [117.88, 1.83], [119, 0.9], [117.81, 0.78], [117.48, 0.1], [117.52, -0.8], [116.56, -1.49], [116.53, -2.48], [116.15, -4.01], [116, -3.66], [114.86, -4.11], [114.47, -3.5], [113.76, -3.44], [113.26, -3.12], [112.07, -3.48], [111.7, -2.99], [111.05, -3.05], [110.22, -2.93], [110.07, -1.59], [109.57, -1.31], [109.09, -0.46], [108.95, 0.42], [109.07, 1.34], [109.66, 2.01], [109.83, 1.34], [110.51, 0.77], [111.16, 0.98], [111.8, 0.9], [112.38, 1.41], [112.86, 1.5], [113.81, 1.22], [114.62, 1.43], [115.13, 2.82], [115.52, 3.17], [115.87, 4.31], [117.02, 4.31], [117.88, 4.14]]], [[[129.37, -2.8], [130.47, -3.09], [130.83, -3.86], [129.99, -3.45], [129.16, -3.36], [128.59, -3.43], [127.9, -3.39], [128.14, -2.84], [129.37, -2.8]]], [[[126.87, -3.79], [126.18, -3.61], [125.99, -3.18], [127, -3.13], [127.25, -3.46], [126.87, -3.79]]], [[[127.93, 2.17], [128, 1.63], [128.59, 1.54], [128.69, 1.13], [128.64, 0.26], [128.12, 0.36], [127.97, -0.25], [128.38, -0.78], [128.1, -0.9], [127.7, -0.27], [127.4, 1.01], [127.6, 1.81], [127.93, 2.17]]], [[[122.93, 0.88], [124.08, 0.92], [125.07, 1.64], [125.24, 1.42], [124.44, 0.43], [123.69, 0.24], [122.72, 0.43], [121.06, 0.38], [120.18, 0.24], [120.04, -0.52], [120.94, -1.41], [121.48, -0.96], [123.34, -0.62], [123.26, -1.08], [122.82, -0.93], [122.39, -1.52], [121.51, -1.9], [122.45, -3.19], [122.27, -3.53], [123.17, -4.68], [123.16, -5.34], [122.63, -5.63], [122.24, -5.28], [122.72, -4.46], [121.74, -4.85], [121.49, -4.57], [121.62, -4.19], [120.9, -3.6], [120.97, -2.63], [120.31, -2.93], [120.39, -4.1], [120.43, -5.53], [119.8, -5.67], [119.37, -5.38], [119.65, -4.46], [119.5, -3.49], [119.08, -3.49], [118.77, -2.8], [119.18, -2.15], [119.32, -1.35], [119.83, 0.15], [120.04, 0.57], [120.89, 1.31], [121.67, 1.01], [122.93, 0.88]]], [[[120.3, -10.26], [118.97, -9.56], [119.9, -9.36], [120.43, -9.67], [120.78, -9.97], [120.72, -10.24], [120.3, -10.26]]], [[[121.34, -8.54], [122.01, -8.46], [122.9, -8.09], [122.76, -8.65], [121.25, -8.93], [119.92, -8.81], [119.92, -8.44], [120.72, -8.24], [121.34, -8.54]]], [[[118.26, -8.36], [118.88, -8.28], [119.13, -8.71], [117.97, -8.91], [117.28, -9.04], [116.74, -9.03], [117.08, -8.46], [117.63, -8.45], [117.9, -8.1], [118.26, -8.36]]], [[[108.49, -6.42], [108.62, -6.78], [110.54, -6.88], [110.76, -6.47], [112.61, -6.95], [112.98, -7.59], [114.48, -7.78], [115.71, -8.37], [114.56, -8.75], [113.46, -8.35], [112.56, -8.38], [111.52, -8.3], [110.59, -8.12], [109.43, -7.74], [108.69, -7.64], [108.28, -7.77], [106.45, -7.35], [106.28, -6.92], [105.37, -6.85], [106.05, -5.9], [107.27, -5.95], [108.07, -6.35], [108.49, -6.42]]], [[[104.37, -1.08], [104.54, -1.78], [104.89, -2.34], [105.62, -2.43], [106.11, -3.06], [105.86, -4.31], [105.82, -5.85], [104.71, -5.87], [103.87, -5.04], [102.58, -4.22], [102.16, -3.61], [101.4, -2.8], [100.9, -2.05], [100.14, -0.65], [99.26, 0.18], [98.97, 1.04], [98.6, 1.82], [97.7, 2.45], [97.18, 3.31], [96.42, 3.87], [95.38, 4.97], [95.29, 5.48], [95.94, 5.44], [97.48, 5.25], [98.37, 4.27], [99.14, 3.59], [99.69, 3.17], [100.64, 2.1], [101.66, 2.08], [102.5, 1.4], [103.08, 0.56], [103.84, 0.1], [103.44, -0.71], [104.01, -1.06], [104.37, -1.08]]]] } }, { type: "Feature", properties: { iso3: "ARG", имя: "Аргентина", имя_en: "Argentina", регион: "South America", континент: "South America" }, geometry: { type: "MultiPolygon", coordinates: [[[[-68.63, -52.64], [-68.25, -53.1], [-67.75, -53.85], [-66.45, -54.45], [-65.05, -54.7], [-65.5, -55.2], [-66.45, -55.25], [-66.96, -54.9], [-67.56, -54.87], [-68.63, -54.87], [-68.63, -52.64]]], [[[-57.63, -30.22], [-57.87, -31.02], [-58.14, -32.04], [-58.13, -33.04], [-58.35, -33.26], [-58.43, -33.91], [-58.5, -34.43], [-57.23, -35.29], [-57.36, -35.98], [-56.74, -36.41], [-56.79, -36.9], [-57.75, -38.18], [-59.23, -38.72], [-61.24, -38.93], [-62.34, -38.83], [-62.13, -39.42], [-62.33, -40.17], [-62.15, -40.68], [-62.75, -41.03], [-63.77, -41.17], [-64.73, -40.8], [-65.12, -41.06], [-64.98, -42.06], [-64.3, -42.36], [-63.76, -42.04], [-63.46, -42.56], [-64.38, -42.87], [-65.18, -43.5], [-65.33, -44.5], [-65.57, -45.04], [-66.51, -45.04], [-67.29, -45.55], [-67.58, -46.3], [-66.6, -47.03], [-65.64, -47.24], [-65.99, -48.13], [-67.17, -48.7], [-67.82, -49.87], [-68.73, -50.26], [-69.14, -50.73], [-68.82, -51.77], [-68.15, -52.35], [-68.57, -52.3], [-69.5, -52.14], [-71.91, -52.01], [-72.33, -51.43], [-72.31, -50.68], [-72.98, -50.74], [-73.33, -50.38], [-73.42, -49.32], [-72.65, -48.88], [-72.33, -48.24], [-72.45, -47.74], [-71.92, -46.88], [-71.55, -45.56], [-71.66, -44.97], [-71.22, -44.78], [-71.33, -44.41], [-71.79, -44.21], [-71.46, -43.79], [-71.92, -43.41], [-72.15, -42.25], [-71.75, -42.05], [-71.92, -40.83], [-71.68, -39.81], [-71.41, -38.92], [-70.81, -38.55], [-71.12, -37.58], [-71.12, -36.66], [-70.36, -36.01], [-70.39, -35.17], [-69.82, -34.19], [-69.81, -33.27], [-70.07, -33.09], [-70.54, -31.37], [-69.92, -30.34], [-70.01, -29.37], [-69.66, -28.46], [-69, -27.52], [-68.3, -26.9], [-68.59, -26.51], [-68.39, -26.19], [-68.42, -24.52], [-67.33, -24.03], [-66.99, -22.99], [-67.11, -22.74], [-66.27, -21.83], [-64.96, -22.08], [-64.38, -22.8], [-63.99, -21.99], [-62.85, -22.03], [-62.69, -22.25], [-60.85, -23.88], [-60.03, -24.03], [-58.81, -24.77], [-57.78, -25.16], [-57.63, -25.6], [-58.62, -27.12], [-57.61, -27.4], [-56.49, -27.55], [-55.7, -27.39], [-54.79, -26.62], [-54.63, -25.74], [-54.13, -25.55], [-53.63, -26.12], [-53.65, -26.92], [-54.49, -27.47], [-55.16, -27.88], [-56.29, -28.85], [-57.63, -30.22]]]] } }, { type: "Feature", properties: { iso3: "CHL", имя: "Чили", имя_en: "Chile", регион: "South America", континент: "South America" }, geometry: { type: "MultiPolygon", coordinates: [[[[-68.63, -52.64], [-68.63, -54.87], [-67.56, -54.87], [-66.96, -54.9], [-67.29, -55.3], [-68.15, -55.61], [-68.64, -55.58], [-69.23, -55.5], [-69.96, -55.2], [-71.01, -55.05], [-72.26, -54.5], [-73.29, -53.96], [-74.66, -52.84], [-73.84, -53.05], [-72.43, -53.72], [-71.11, -54.07], [-70.59, -53.62], [-70.27, -52.93], [-69.35, -52.52], [-68.63, -52.64]]], [[[-69.59, -17.58], [-69.1, -18.26], [-68.97, -18.98], [-68.44, -19.41], [-68.76, -20.37], [-68.22, -21.49], [-67.83, -22.87], [-67.11, -22.74], [-66.99, -22.99], [-67.33, -24.03], [-68.42, -24.52], [-68.39, -26.19], [-68.59, -26.51], [-68.3, -26.9], [-69, -27.52], [-69.66, -28.46], [-70.01, -29.37], [-69.92, -30.34], [-70.54, -31.37], [-70.07, -33.09], [-69.81, -33.27], [-69.82, -34.19], [-70.39, -35.17], [-70.36, -36.01], [-71.12, -36.66], [-71.12, -37.58], [-70.81, -38.55], [-71.41, -38.92], [-71.68, -39.81], [-71.92, -40.83], [-71.75, -42.05], [-72.15, -42.25], [-71.92, -43.41], [-71.46, -43.79], [-71.79, -44.21], [-71.33, -44.41], [-71.22, -44.78], [-71.66, -44.97], [-71.55, -45.56], [-71.92, -46.88], [-72.45, -47.74], [-72.33, -48.24], [-72.65, -48.88], [-73.42, -49.32], [-73.33, -50.38], [-72.98, -50.74], [-72.31, -50.68], [-72.33, -51.43], [-71.91, -52.01], [-69.5, -52.14], [-68.57, -52.3], [-69.46, -52.29], [-69.94, -52.54], [-70.85, -52.9], [-71.01, -53.83], [-71.43, -53.86], [-72.56, -53.53], [-73.7, -52.84], [-73.7, -52.84], [-74.95, -52.26], [-75.26, -51.63], [-74.98, -51.04], [-75.48, -50.38], [-75.61, -48.67], [-75.18, -47.71], [-74.13, -46.94], [-75.64, -46.65], [-74.69, -45.76], [-74.35, -44.1], [-73.24, -44.45], [-72.72, -42.38], [-73.39, -42.12], [-73.7, -43.37], [-74.33, -43.22], [-74.02, -41.79], [-73.68, -39.94], [-73.22, -39.26], [-73.51, -38.28], [-73.59, -37.16], [-73.17, -37.12], [-72.55, -35.51], [-71.86, -33.91], [-71.44, -32.42], [-71.67, -30.92], [-71.37, -30.1], [-71.49, -28.86], [-70.91, -27.64], [-70.72, -25.71], [-70.4, -23.63], [-70.09, -21.39], [-70.16, -19.76], [-70.37, -18.35], [-69.86, -18.09], [-69.59, -17.58]]]] } }, { type: "Feature", properties: { iso3: "COD", имя: "Демократическая Республика Конго", имя_en: "Dem. Rep. Congo", регион: "Middle Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[29.34, -4.5], [29.52, -5.42], [29.42, -5.94], [29.62, -6.52], [30.2, -7.08], [30.74, -8.34], [30.74, -8.34], [30.35, -8.24], [29, -8.41], [28.73, -8.53], [28.45, -9.16], [28.67, -9.61], [28.5, -10.79], [28.37, -11.79], [28.64, -11.97], [29.34, -12.36], [29.62, -12.18], [29.7, -13.26], [28.93, -13.25], [28.52, -12.7], [28.16, -12.27], [27.39, -12.13], [27.16, -11.61], [26.55, -11.92], [25.75, -11.78], [25.42, -11.33], [24.78, -11.24], [24.31, -11.26], [24.26, -10.95], [23.91, -10.93], [23.46, -10.87], [22.84, -11.02], [22.4, -10.99], [22.16, -11.08], [22.21, -9.89], [21.88, -9.52], [21.8, -8.91], [21.95, -8.31], [21.75, -7.92], [21.73, -7.29], [20.51, -7.3], [20.6, -6.94], [20.09, -6.94], [20.04, -7.12], [19.42, -7.16], [19.17, -7.74], [19.02, -7.99], [18.46, -7.85], [18.13, -7.99], [17.47, -8.07], [17.09, -7.55], [16.86, -7.22], [16.57, -6.62], [16.33, -5.88], [13.38, -5.86], [13.02, -5.98], [12.74, -5.97], [12.32, -6.1], [12.18, -5.79], [12.44, -5.68], [12.47, -5.25], [12.63, -4.99], [13, -4.78], [13.26, -4.88], [13.6, -4.5], [14.14, -4.51], [14.21, -4.79], [14.58, -4.97], [15.17, -4.34], [15.75, -3.86], [16.01, -3.54], [15.97, -2.71], [16.41, -1.74], [16.87, -1.23], [17.52, -0.74], [17.64, -0.42], [17.66, -0.06], [17.83, 0.29], [17.77, 0.86], [17.9, 1.74], [18.09, 2.37], [18.39, 2.9], [18.45, 3.5], [18.54, 4.2], [18.93, 4.71], [19.47, 5.03], [20.29, 4.69], [20.93, 4.32], [21.66, 4.22], [22.41, 4.03], [22.7, 4.63], [22.84, 4.71], [23.3, 4.61], [24.41, 5.11], [24.81, 4.9], [25.13, 4.93], [25.28, 5.17], [25.65, 5.26], [26.4, 5.15], [27.04, 5.13], [27.37, 5.23], [27.98, 4.41], [28.43, 4.29], [28.7, 4.46], [29.16, 4.39], [29.72, 4.6], [29.95, 4.17], [30.83, 3.51], [30.83, 3.51], [30.77, 2.34], [31.17, 2.2], [30.85, 1.85], [30.47, 1.58], [30.09, 1.06], [29.88, 0.6], [29.82, -0.21], [29.59, -0.59], [29.58, -1.34], [29.29, -1.62], [29.25, -2.22], [29.12, -2.29], [29.02, -2.84], [29.28, -3.29], [29.34, -4.5]]] } }, { type: "Feature", properties: { iso3: "SOM", имя: "Сомали", имя_en: "Somalia", регион: "Eastern Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[41.59, -1.68], [40.99, -0.86], [40.98, 2.78], [41.86, 3.92], [42.13, 4.23], [42.77, 4.25], [43.66, 4.96], [44.96, 5], [47.79, 8], [48.49, 8.84], [48.94, 9.45], [48.94, 9.97], [48.94, 10.98], [48.94, 11.39], [48.95, 11.41], [48.95, 11.41], [49.27, 11.43], [49.73, 11.58], [50.26, 11.68], [50.73, 12.02], [51.11, 12.02], [51.13, 11.75], [51.04, 11.17], [51.05, 10.64], [50.83, 10.28], [50.55, 9.2], [50.07, 8.08], [49.45, 6.8], [48.59, 5.34], [47.74, 4.22], [46.56, 2.86], [45.56, 2.05], [44.07, 1.05], [43.14, 0.29], [42.04, -0.92], [41.81, -1.45], [41.59, -1.68]]] } }, { type: "Feature", properties: { iso3: "KEN", имя: "Кения", имя_en: "Kenya", регион: "Eastern Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[39.2, -4.68], [37.77, -3.68], [37.7, -3.1], [34.07, -1.06], [33.9, -0.95], [33.89, 0.11], [34.18, 0.52], [34.67, 1.18], [35.04, 1.91], [34.6, 3.05], [34.48, 3.56], [34.01, 4.25], [34.62, 4.85], [35.3, 5.51], [35.82, 5.34], [35.82, 4.78], [36.16, 4.45], [36.86, 4.45], [38.12, 3.6], [38.44, 3.59], [38.67, 3.62], [38.89, 3.5], [39.56, 3.42], [39.85, 3.84], [40.77, 4.26], [41.17, 3.92], [41.86, 3.92], [40.98, 2.78], [40.99, -0.86], [41.59, -1.68], [40.88, -2.08], [40.64, -2.5], [40.26, -2.57], [40.12, -3.28], [39.8, -3.68], [39.6, -4.35], [39.2, -4.68]]] } }, { type: "Feature", properties: { iso3: "SDN", имя: "Судан", имя_en: "Sudan", регион: "Northern Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[24.57, 8.23], [23.81, 8.67], [23.46, 8.95], [23.39, 9.27], [23.56, 9.68], [23.55, 10.09], [22.98, 10.71], [22.86, 11.14], [22.88, 11.38], [22.51, 11.68], [22.5, 12.26], [22.29, 12.65], [21.94, 12.59], [22.04, 12.96], [22.3, 13.37], [22.18, 13.79], [22.51, 14.09], [22.3, 14.33], [22.57, 14.94], [23.02, 15.68], [23.89, 15.61], [23.84, 19.58], [23.85, 20], [25, 20], [25, 22], [29.02, 22], [32.9, 22], [36.87, 22], [37.19, 21.02], [36.97, 20.84], [37.11, 19.81], [37.48, 18.61], [37.86, 18.37], [38.41, 18], [37.9, 17.43], [37.17, 17.26], [36.85, 16.96], [36.75, 16.29], [36.32, 14.82], [36.43, 14.42], [36.27, 13.56], [35.86, 12.58], [35.26, 12.08], [34.83, 11.32], [34.73, 10.91], [34.26, 10.63], [33.96, 9.58], [33.97, 8.68], [33.96, 9.46], [33.82, 9.48], [33.84, 9.98], [33.72, 10.33], [33.21, 10.72], [33.09, 11.44], [33.21, 12.18], [32.74, 12.25], [32.67, 12.02], [32.07, 11.97], [32.31, 11.68], [32.4, 11.08], [31.85, 10.53], [31.35, 9.81], [30.84, 9.71], [30, 10.29], [29.62, 10.08], [29.52, 9.79], [29, 9.6], [28.97, 9.4], [27.97, 9.4], [27.83, 9.6], [27.11, 9.64], [26.75, 9.47], [26.48, 9.55], [25.96, 10.14], [25.79, 10.41], [25.07, 10.27], [24.79, 9.81], [24.54, 8.92], [24.19, 8.73], [23.89, 8.62], [24.57, 8.23]]] } }, { type: "Feature", properties: { iso3: "TCD", имя: "Чад", имя_en: "Chad", регион: "Middle Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[23.84, 19.58], [23.89, 15.61], [23.02, 15.68], [22.57, 14.94], [22.3, 14.33], [22.51, 14.09], [22.18, 13.79], [22.3, 13.37], [22.04, 12.96], [21.94, 12.59], [22.29, 12.65], [22.5, 12.26], [22.51, 11.68], [22.88, 11.38], [22.86, 11.14], [22.23, 10.97], [21.72, 10.57], [21, 9.48], [20.06, 9.01], [19.09, 9.07], [18.81, 8.98], [18.91, 8.63], [18.39, 8.28], [17.96, 7.89], [16.71, 7.51], [16.46, 7.73], [16.29, 7.75], [16.11, 7.5], [15.28, 7.42], [15.44, 7.69], [15.12, 8.38], [14.98, 8.8], [14.54, 8.97], [13.95, 9.55], [14.17, 10.02], [14.63, 9.92], [14.91, 9.99], [15.47, 9.98], [14.92, 10.89], [14.96, 11.56], [14.89, 12.22], [14.5, 12.86], [14.6, 13.33], [13.95, 13.35], [13.96, 14], [13.54, 14.37], [13.97, 15.68], [15.25, 16.63], [15.3, 17.93], [15.69, 19.96], [15.9, 20.39], [15.49, 20.73], [15.47, 21.05], [15.1, 21.31], [14.85, 22.86], [15.86, 23.41], [19.85, 21.5], [23.84, 19.58]]] } }, { type: "Feature", properties: { iso3: "HTI", имя: "Республика Гаити", имя_en: "Haiti", регион: "Caribbean", континент: "North America" }, geometry: { type: "Polygon", coordinates: [[[-71.71, 19.71], [-71.62, 19.17], [-71.7, 18.79], [-71.95, 18.62], [-71.69, 18.32], [-71.71, 18.04], [-72.37, 18.21], [-72.84, 18.15], [-73.45, 18.22], [-73.92, 18.03], [-74.46, 18.34], [-74.37, 18.66], [-73.45, 18.53], [-72.69, 18.45], [-72.33, 18.67], [-72.79, 19.1], [-72.78, 19.48], [-73.42, 19.64], [-73.19, 19.92], [-72.58, 19.87], [-71.71, 19.71]]] } }, { type: "Feature", properties: { iso3: "DOM", имя: "Доминиканская Республика", имя_en: "Dominican Rep.", регион: "Caribbean", континент: "North America" }, geometry: { type: "Polygon", coordinates: [[[-71.71, 18.04], [-71.69, 18.32], [-71.95, 18.62], [-71.7, 18.79], [-71.62, 19.17], [-71.71, 19.71], [-71.59, 19.88], [-70.81, 19.88], [-70.21, 19.62], [-69.95, 19.65], [-69.77, 19.29], [-69.22, 19.31], [-69.25, 19.02], [-68.81, 18.98], [-68.32, 18.61], [-68.69, 18.21], [-69.16, 18.42], [-69.62, 18.38], [-69.95, 18.43], [-70.13, 18.25], [-70.52, 18.18], [-70.67, 18.43], [-71, 18.28], [-71.4, 17.6], [-71.66, 17.76], [-71.71, 18.04]]] } }, { type: "Feature", properties: { iso3: "RUS", имя: "Россия", имя_en: "Russia", регион: "Eastern Europe", континент: "Europe" }, geometry: { type: "MultiPolygon", coordinates: [[[[178.73, 71.1], [180, 71.52], [180, 70.83], [178.9, 70.78], [178.73, 71.1]]], [[[49.1, 46.4], [48.65, 45.81], [47.68, 45.64], [46.68, 44.61], [47.59, 43.66], [47.49, 42.99], [48.58, 41.81], [48.58, 41.81], [47.99, 41.41], [47.82, 41.15], [47.37, 41.22], [46.69, 41.83], [46.4, 41.86], [45.78, 42.09], [45.47, 42.5], [44.54, 42.71], [43.93, 42.55], [43.76, 42.74], [42.39, 43.22], [40.92, 43.38], [40.08, 43.55], [39.96, 43.43], [38.68, 44.28], [37.54, 44.66], [36.68, 45.24], [37.4, 45.4], [38.23, 46.24], [37.67, 46.64], [39.15, 47.04], [39.12, 47.26], [38.22, 47.1], [38.26, 47.55], [38.77, 47.83], [39.74, 47.9], [39.9, 48.23], [39.67, 48.78], [40.08, 49.31], [40.07, 49.6], [38.59, 49.93], [38.01, 49.92], [37.39, 50.38], [36.63, 50.23], [35.36, 50.58], [35.38, 50.77], [35.02, 51.21], [34.22, 51.26], [34.14, 51.57], [34.39, 51.77], [33.75, 52.34], [32.72, 52.24], [32.41, 52.29], [32.16, 52.06], [31.79, 52.1], [31.79, 52.1], [31.54, 52.74], [31.31, 53.07], [31.5, 53.17], [32.3, 53.13], [32.69, 53.35], [32.41, 53.62], [31.73, 53.79], [31.79, 53.97], [31.38, 54.16], [30.76, 54.81], [30.97, 55.08], [30.87, 55.55], [29.9, 55.79], [29.37, 55.67], [29.23, 55.92], [28.18, 56.17], [27.86, 56.76], [27.77, 57.24], [27.29, 57.47], [27.72, 57.79], [27.42, 58.72], [28.13, 59.3], [27.98, 59.48], [27.98, 59.48], [29.12, 60.03], [28.07, 60.5], [28.07, 60.5], [30.21, 61.78], [31.14, 62.36], [31.52, 62.87], [30.04, 63.55], [30.44, 64.2], [29.54, 64.95], [30.22, 65.81], [29.05, 66.94], [29.98, 67.7], [28.45, 68.36], [28.59, 69.06], [29.4, 69.16], [31.1, 69.56], [31.1, 69.56], [32.13, 69.91], [33.78, 69.3], [36.51, 69.06], [40.29, 67.93], [41.06, 67.46], [41.13, 66.79], [40.02, 66.27], [38.38, 66], [33.92, 66.76], [33.18, 66.63], [34.81, 65.9], [34.88, 65.44], [34.94, 64.41], [36.23, 64.11], [37.01, 63.85], [37.14, 64.33], [36.54, 64.76], [37.18, 65.14], [39.59, 64.52], [40.44, 64.76], [39.76, 65.5], [42.09, 66.48], [43.02, 66.42], [43.95, 66.07], [44.53, 66.76], [43.7, 67.35], [44.19, 67.95], [43.45, 68.57], [46.25, 68.25], [46.82, 67.69], [45.56, 67.57], [45.56, 67.01], [46.35, 66.67], [47.89, 66.88], [48.14, 67.52], [50.23, 68], [53.72, 68.86], [54.47, 68.81], [53.49, 68.2], [54.73, 68.1], [55.44, 68.44], [57.32, 68.47], [58.8, 68.88], [59.94, 68.28], [61.08, 68.94], [60.03, 69.52], [60.55, 69.85], [63.5, 69.55], [64.89, 69.23], [68.51, 68.09], [69.18, 68.62], [68.16, 69.14], [68.14, 69.36], [66.93, 69.45], [67.26, 69.93], [66.72, 70.71], [66.69, 71.03], [68.54, 71.93], [69.2, 72.84], [69.94, 73.04], [72.59, 72.78], [72.8, 72.22], [71.85, 71.41], [72.47, 71.09], [72.79, 70.39], [72.56, 69.02], [73.67, 68.41], [73.24, 67.74], [71.28, 66.32], [72.42, 66.17], [72.82, 66.53], [73.92, 66.79], [74.19, 67.28], [75.05, 67.76], [74.47, 68.33], [74.94, 68.99], [73.84, 69.07], [73.6, 69.63], [74.4, 70.63], [73.1, 71.45], [74.89, 72.12], [74.66, 72.83], [75.16, 72.85], [75.68, 72.3], [75.29, 71.34], [76.36, 71.15], [75.9, 71.87], [77.58, 72.27], [79.65, 72.32], [81.5, 71.75], [80.61, 72.58], [80.51, 73.65], [82.25, 73.85], [84.66, 73.81], [86.82, 73.94], [86.01, 74.46], [87.17, 75.12], [88.32, 75.14], [90.26, 75.64], [92.9, 75.77], [93.23, 76.05], [95.86, 76.14], [96.68, 75.92], [98.92, 76.45], [100.76, 76.43], [101.04, 76.86], [101.99, 77.29], [104.35, 77.7], [106.07, 77.37], [104.7, 77.13], [106.97, 76.97], [107.24, 76.48], [108.15, 76.72], [111.08, 76.71], [113.33, 76.22], [114.13, 75.85], [113.89, 75.33], [112.78, 75.03], [110.15, 74.48], [109.4, 74.18], [110.64, 74.04], [112.12, 73.79], [113.02, 73.98], [113.53, 73.34], [113.97, 73.59], [115.57, 73.75], [118.78, 73.59], [119.02, 73.12], [123.2, 72.97], [123.26, 73.74], [125.38, 73.56], [126.98, 73.57], [128.59, 73.04], [129.05, 72.4], [128.46, 71.98], [129.72, 71.19], [131.29, 70.79], [132.25, 71.84], [133.86, 71.39], [135.56, 71.66], [137.5, 71.35], [138.23, 71.63], [139.87, 71.49], [139.15, 72.42], [140.47, 72.85], [149.5, 72.2], [150.35, 71.61], [152.97, 70.84], [157.01, 71.03], [159, 70.87], [159.83, 70.45], [159.71, 69.72], [160.94, 69.44], [162.28, 69.64], [164.05, 69.67], [165.94, 69.47], [167.84, 69.58], [169.58, 68.69], [170.82, 69.01], [170.01, 69.65], [170.45, 70.1], [173.64, 69.82], [175.72, 69.88], [178.6, 69.4], [180, 68.96], [180, 64.98], [179.99, 64.97], [178.71, 64.53], [177.41, 64.61], [178.31, 64.08], [178.91, 63.25], [179.37, 62.98], [179.49, 62.57], [179.23, 62.3], [177.36, 62.52], [174.57, 61.77], [173.68, 61.65], [172.15, 60.95], [170.7, 60.34], [170.33, 59.88], [168.9, 60.57], [166.29, 59.79], [165.84, 60.16], [164.88, 59.73], [163.54, 59.87], [163.22, 59.21], [162.02, 58.24], [162.05, 57.84], [163.19, 57.62], [163.06, 56.16], [162.13, 56.12], [161.7, 55.29], [162.12, 54.86], [160.37, 54.34], [160.02, 53.2], [158.53, 52.96], [158.23, 51.94], [156.79, 51.01], [156.42, 51.7], [155.99, 53.16], [155.43, 55.38], [155.91, 56.77], [156.76, 57.36], [156.81, 57.83], [158.36, 58.06], [160.15, 59.31], [161.87, 60.34], [163.67, 61.14], [164.47, 62.55], [163.26, 62.47], [162.66, 61.64], [160.12, 60.54], [159.3, 61.77], [156.72, 61.43], [154.22, 59.76], [155.04, 59.14], [152.81, 58.88], [151.27, 58.78], [151.34, 59.5], [149.78, 59.66], [148.54, 59.16], [145.49, 59.34], [142.2, 59.04], [138.96, 57.09], [135.13, 54.73], [136.7, 54.6], [137.19, 53.98], [138.16, 53.76], [138.8, 54.25], [139.9, 54.19], [141.35, 53.09], [141.38, 52.24], [140.6, 51.24], [140.51, 50.05], [140.06, 48.45], [138.55, 47], [138.22, 46.31], [136.86, 45.14], [135.52, 43.99], [134.87, 43.4], [133.54, 42.81], [132.91, 42.8], [132.28, 43.28], [130.94, 42.55], [130.78, 42.22], [130.78, 42.22], [130.78, 42.22], [130.78, 42.22], [130.64, 42.4], [130.64, 42.4], [130.63, 42.9], [131.14, 42.93], [131.29, 44.11], [131.03, 44.97], [131.88, 45.32], [133.1, 45.14], [133.77, 46.12], [134.11, 47.21], [134.5, 47.58], [135.03, 48.48], [133.37, 48.18], [132.51, 47.79], [130.99, 47.79], [130.58, 48.73], [129.4, 49.44], [127.66, 49.76], [127.29, 50.74], [126.94, 51.35], [126.56, 51.78], [125.95, 52.79], [125.07, 53.16], [123.57, 53.46], [122.25, 53.43], [121, 53.25], [120.18, 52.75], [120.73, 52.52], [120.74, 51.96], [120.18, 51.64], [119.28, 50.58], [119.29, 50.14], [117.88, 49.51], [116.68, 49.89], [115.49, 49.81], [114.96, 50.14], [114.36, 50.25], [112.9, 49.54], [111.58, 49.38], [110.66, 49.13], [109.4, 49.29], [108.48, 49.28], [107.87, 49.79], [106.89, 50.27], [105.89, 50.41], [104.62, 50.28], [103.68, 50.09], [102.26, 50.51], [102.07, 51.26], [100.89, 51.52], [99.98, 51.63], [98.86, 52.05], [97.83, 51.01], [98.23, 50.42], [97.26, 49.73], [95.81, 49.98], [94.82, 50.01], [94.15, 50.48], [93.1, 50.5], [92.23, 50.8], [90.71, 50.33], [88.81, 49.47], [87.75, 49.3], [87.36, 49.21], [86.83, 49.83], [85.54, 49.69], [85.12, 50.12], [84.42, 50.31], [83.94, 50.89], [83.38, 51.07], [81.95, 50.81], [80.57, 51.39], [80.04, 50.86], [77.8, 53.4], [76.53, 54.18], [76.89, 54.49], [74.38, 53.55], [73.43, 53.49], [73.51, 54.04], [72.22, 54.38], [71.18, 54.13], [70.87, 55.17], [69.07, 55.39], [68.17, 54.97], [65.67, 54.6], [65.18, 54.35], [61.44, 54.01], [60.98, 53.66], [61.7, 52.98], [60.74, 52.72], [60.93, 52.45], [59.97, 51.96], [61.59, 51.27], [61.34, 50.8], [59.93, 50.84], [59.64, 50.55], [58.36, 51.06], [56.78, 51.04], [55.72, 50.62], [54.53, 51.03], [52.33, 51.72], [50.77, 51.69], [48.7, 50.61], [48.58, 49.87], [47.55, 50.45], [46.75, 49.36], [47.04, 49.15], [46.47, 48.39], [47.32, 47.72], [48.06, 47.74], [48.69, 47.08], [48.59, 46.56], [49.1, 46.4]]], [[[93.78, 81.02], [95.94, 81.25], [97.88, 80.75], [100.19, 79.78], [99.94, 78.88], [97.76, 78.76], [94.97, 79.04], [93.31, 79.43], [92.55, 80.14], [91.18, 80.34], [93.78, 81.02]]], [[[102.84, 79.28], [105.37, 78.71], [105.08, 78.31], [99.44, 77.92], [101.26, 79.23], [102.09, 79.35], [102.84, 79.28]]], [[[138.83, 76.14], [141.47, 76.09], [145.09, 75.56], [144.3, 74.82], [140.61, 74.85], [138.96, 74.61], [136.97, 75.26], [137.51, 75.95], [138.83, 76.14]]], [[[148.22, 75.35], [150.73, 75.08], [149.58, 74.69], [147.98, 74.78], [146.12, 75.17], [146.36, 75.5], [148.22, 75.35]]], [[[139.86, 73.37], [140.81, 73.77], [142.06, 73.86], [143.48, 73.48], [143.6, 73.21], [142.09, 73.21], [140.04, 73.32], [139.86, 73.37]]], [[[44.85, 80.59], [46.8, 80.77], [48.32, 80.78], [48.52, 80.51], [49.1, 80.75], [50.04, 80.92], [51.52, 80.7], [51.14, 80.55], [49.79, 80.42], [48.89, 80.34], [48.75, 80.18], [47.59, 80.01], [46.5, 80.25], [47.07, 80.56], [44.85, 80.59]]], [[[22.73, 54.33], [20.89, 54.31], [19.66, 54.43], [19.89, 54.87], [21.27, 55.19], [22.32, 55.02], [22.76, 54.86], [22.65, 54.58], [22.73, 54.33]]], [[[53.51, 73.75], [55.9, 74.63], [55.63, 75.08], [57.87, 75.61], [61.17, 76.25], [64.5, 76.44], [66.21, 76.81], [68.16, 76.94], [68.85, 76.54], [68.18, 76.23], [64.64, 75.74], [61.58, 75.26], [58.48, 74.31], [56.99, 73.33], [55.42, 72.37], [55.62, 71.54], [57.54, 70.72], [56.94, 70.63], [53.68, 70.76], [53.41, 71.21], [51.6, 71.47], [51.46, 72.01], [52.48, 72.23], [52.44, 72.77], [54.43, 73.63], [53.51, 73.75]]], [[[142.91, 53.7], [143.26, 52.74], [143.24, 51.76], [143.65, 50.75], [144.65, 48.98], [143.17, 49.31], [142.56, 47.86], [143.53, 46.84], [143.51, 46.14], [142.75, 46.74], [142.09, 45.97], [141.91, 46.81], [142.02, 47.78], [141.9, 48.86], [142.14, 49.62], [142.18, 50.95], [141.59, 51.94], [141.68, 53.3], [142.61, 53.76], [142.21, 54.23], [142.65, 54.37], [142.91, 53.7]]], [[[-174.93, 67.21], [-175.01, 66.58], [-174.34, 66.34], [-174.57, 67.06], [-171.86, 66.91], [-169.9, 65.98], [-170.89, 65.54], [-172.53, 65.44], [-172.56, 64.46], [-172.96, 64.25], [-173.89, 64.28], [-174.65, 64.63], [-175.98, 64.92], [-176.21, 65.36], [-177.22, 65.52], [-178.36, 65.39], [-178.9, 65.74], [-178.69, 66.11], [-179.88, 65.87], [-179.43, 65.4], [-180, 64.98], [-180, 68.96], [-177.55, 68.2], [-174.93, 67.21]]], [[[-178.69, 70.89], [-180, 70.83], [-180, 71.52], [-179.87, 71.56], [-179.02, 71.56], [-177.58, 71.27], [-177.66, 71.13], [-178.69, 70.89]]], [[[33.44, 45.97], [33.7, 46.22], [34.41, 46.01], [34.73, 45.97], [34.86, 45.77], [35.01, 45.74], [35.02, 45.65], [35.51, 45.41], [36.53, 45.47], [36.33, 45.11], [35.24, 44.94], [33.88, 44.36], [33.33, 44.56], [33.55, 45.03], [32.45, 45.33], [32.63, 45.52], [33.59, 45.85], [33.44, 45.97]]]] } }, { type: "Feature", properties: { iso3: "BHS", имя: "Багамские Острова", имя_en: "Bahamas", регион: "Caribbean", континент: "North America" }, geometry: { type: "MultiPolygon", coordinates: [[[[-78.98, 26.79], [-78.51, 26.87], [-77.85, 26.84], [-77.82, 26.58], [-78.91, 26.42], [-78.98, 26.79]]], [[[-77.79, 27.04], [-77, 26.59], [-77.17, 25.88], [-77.36, 26.01], [-77.34, 26.53], [-77.79, 26.93], [-77.79, 27.04]]], [[[-78.19, 25.21], [-77.89, 25.17], [-77.54, 24.34], [-77.53, 23.76], [-77.78, 23.71], [-78.03, 24.29], [-78.41, 24.58], [-78.19, 25.21]]]] } }, { type: "Feature", properties: { iso3: "FLK", имя: "Фолклендские острова", имя_en: "Falkland Is.", регион: "South America", континент: "South America" }, geometry: { type: "Polygon", coordinates: [[[-61.2, -51.85], [-60, -51.25], [-59.15, -51.5], [-58.55, -51.1], [-57.75, -51.55], [-58.05, -51.9], [-59.4, -52.2], [-59.85, -51.85], [-60.7, -52.3], [-61.2, -51.85]]] } }, { type: "Feature", properties: { iso3: "NOR", имя: "Норвегия", имя_en: "Norway", регион: "Northern Europe", континент: "Europe" }, geometry: { type: "MultiPolygon", coordinates: [[[[15.14, 79.67], [15.52, 80.02], [16.99, 80.05], [18.25, 79.7], [21.54, 78.96], [19.03, 78.56], [18.47, 77.83], [17.59, 77.64], [17.12, 76.81], [15.91, 76.77], [13.76, 77.38], [14.67, 77.74], [13.17, 78.02], [11.22, 78.87], [10.44, 79.65], [13.17, 80.01], [13.72, 79.66], [15.14, 79.67]]], [[[31.1, 69.56], [29.4, 69.16], [28.59, 69.06], [29.02, 69.77], [27.73, 70.16], [26.18, 69.83], [25.69, 69.09], [24.74, 68.65], [23.66, 68.89], [22.36, 68.84], [21.24, 69.37], [20.65, 69.11], [20.03, 69.07], [19.88, 68.41], [17.99, 68.57], [17.73, 68.01], [16.77, 68.01], [16.11, 67.3], [15.11, 66.19], [13.56, 64.79], [13.92, 64.45], [13.57, 64.05], [12.58, 64.07], [11.93, 63.13], [11.99, 61.8], [12.63, 61.29], [12.3, 60.12], [11.47, 59.43], [11.03, 58.86], [10.36, 59.47], [8.38, 58.31], [7.05, 58.08], [5.67, 58.59], [5.31, 59.66], [4.99, 61.97], [5.91, 62.61], [8.55, 63.45], [10.53, 64.49], [12.36, 65.88], [14.76, 67.81], [16.44, 68.56], [19.18, 69.82], [21.38, 70.26], [23.02, 70.2], [24.55, 71.03], [26.37, 70.99], [28.17, 71.19], [31.29, 70.45], [30.01, 70.19], [31.1, 69.56]]], [[[27.41, 80.06], [25.92, 79.52], [23.02, 79.4], [20.08, 79.57], [19.9, 79.84], [18.46, 79.86], [17.37, 80.32], [20.46, 80.6], [21.91, 80.36], [22.92, 80.66], [25.45, 80.41], [27.41, 80.06]]], [[[24.72, 77.85], [22.49, 77.44], [20.73, 77.68], [21.42, 77.94], [20.81, 78.25], [22.88, 78.45], [23.28, 78.08], [24.72, 77.85]]]] } }, { type: "Feature", properties: { iso3: "GRL", имя: "Гренландия", имя_en: "Greenland", регион: "Northern America", континент: "North America" }, geometry: { type: "Polygon", coordinates: [[[-46.76, 82.63], [-43.41, 83.23], [-39.9, 83.18], [-38.62, 83.55], [-35.09, 83.65], [-27.1, 83.52], [-20.85, 82.73], [-22.69, 82.34], [-26.52, 82.3], [-31.9, 82.2], [-31.4, 82.02], [-27.86, 82.13], [-24.84, 81.79], [-22.9, 82.09], [-22.07, 81.73], [-23.17, 81.15], [-20.62, 81.52], [-15.77, 81.91], [-12.77, 81.72], [-12.21, 81.29], [-16.29, 80.58], [-16.85, 80.35], [-20.05, 80.18], [-17.73, 80.13], [-18.9, 79.4], [-19.7, 78.75], [-19.67, 77.64], [-18.47, 76.99], [-20.04, 76.94], [-21.68, 76.63], [-19.83, 76.1], [-19.6, 75.25], [-20.67, 75.16], [-19.37, 74.3], [-21.59, 74.22], [-20.43, 73.82], [-20.76, 73.46], [-22.17, 73.31], [-23.57, 73.31], [-22.31, 72.63], [-22.3, 72.18], [-24.28, 72.6], [-24.79, 72.33], [-23.44, 72.08], [-22.13, 71.47], [-21.75, 70.66], [-23.54, 70.47], [-24.31, 70.86], [-25.54, 71.43], [-25.2, 70.75], [-26.36, 70.23], [-23.73, 70.18], [-22.35, 70.13], [-25.03, 69.26], [-27.75, 68.47], [-30.67, 68.13], [-31.78, 68.12], [-32.81, 67.74], [-34.2, 66.68], [-36.35, 65.98], [-37.04, 65.94], [-38.38, 65.69], [-39.81, 65.46], [-40.67, 64.84], [-40.68, 64.14], [-41.19, 63.48], [-42.82, 62.68], [-42.42, 61.9], [-42.87, 61.07], [-43.38, 60.1], [-44.79, 60.04], [-46.26, 60.85], [-48.26, 60.86], [-49.23, 61.41], [-49.9, 62.38], [-51.63, 63.63], [-52.14, 64.28], [-52.28, 65.18], [-53.66, 66.1], [-53.3, 66.84], [-53.97, 67.19], [-52.98, 68.36], [-51.48, 68.73], [-51.08, 69.15], [-50.87, 69.93], [-52.01, 69.57], [-52.56, 69.43], [-53.46, 69.28], [-54.68, 69.61], [-54.75, 70.29], [-54.36, 70.82], [-53.43, 70.84], [-51.39, 70.57], [-53.11, 71.2], [-54, 71.55], [-55, 71.41], [-55.83, 71.65], [-54.72, 72.59], [-55.33, 72.96], [-56.12, 73.65], [-57.32, 74.71], [-58.6, 75.1], [-58.59, 75.52], [-61.27, 76.1], [-63.39, 76.18], [-66.06, 76.13], [-68.5, 76.06], [-69.66, 76.38], [-71.4, 77.01], [-68.78, 77.32], [-66.76, 77.38], [-71.04, 77.64], [-73.3, 78.04], [-73.16, 78.43], [-69.37, 78.91], [-65.71, 79.39], [-65.32, 79.76], [-68.02, 80.12], [-67.15, 80.52], [-63.69, 81.21], [-62.23, 81.32], [-62.65, 81.77], [-60.28, 82.03], [-57.21, 82.19], [-54.13, 82.2], [-53.04, 81.89], [-50.39, 82.44], [-48, 82.06], [-46.6, 81.99], [-44.52, 81.66], [-46.9, 82.2], [-46.76, 82.63]]] } }, { type: "Feature", properties: { iso3: "ATF", имя: "Французские Южные и Антарктические территории", имя_en: "Fr. S. Antarctic Lands", регион: "Seven seas (open ocean)", континент: "Seven seas (open ocean)" }, geometry: { type: "Polygon", coordinates: [[[68.94, -48.62], [69.58, -48.94], [70.53, -49.06], [70.56, -49.26], [70.28, -49.71], [68.75, -49.77], [68.72, -49.24], [68.87, -48.83], [68.94, -48.62]]] } }, { type: "Feature", properties: { iso3: "TLS", имя: "Восточный Тимор", имя_en: "Timor-Leste", регион: "South-Eastern Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[124.97, -8.89], [125.09, -8.66], [125.95, -8.43], [126.64, -8.4], [126.96, -8.27], [127.34, -8.4], [126.97, -8.67], [125.93, -9.11], [125.09, -9.39], [125.07, -9.09], [124.97, -8.89]]] } }, { type: "Feature", properties: { iso3: "ZAF", имя: "ЮАР", имя_en: "South Africa", регион: "Southern Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[16.34, -28.58], [16.82, -28.08], [17.22, -28.36], [17.39, -28.78], [17.84, -28.86], [18.46, -29.05], [19, -28.97], [19.89, -28.46], [19.9, -24.77], [20.17, -24.92], [20.76, -25.87], [20.67, -26.48], [20.89, -26.83], [21.61, -26.73], [22.11, -26.28], [22.58, -25.98], [22.82, -25.5], [23.31, -25.27], [23.73, -25.39], [24.21, -25.67], [25.03, -25.72], [25.66, -25.49], [25.77, -25.17], [25.94, -24.7], [26.49, -24.62], [26.79, -24.24], [27.12, -23.57], [28.02, -22.83], [29.43, -22.09], [29.84, -22.1], [30.32, -22.27], [30.66, -22.15], [31.19, -22.25], [31.67, -23.66], [31.93, -24.37], [31.75, -25.48], [31.84, -25.84], [31.33, -25.66], [31.04, -25.73], [30.95, -26.02], [30.68, -26.4], [30.69, -26.74], [31.28, -27.29], [31.87, -27.18], [32.07, -26.73], [32.83, -26.74], [32.58, -27.47], [32.46, -28.3], [32.2, -28.75], [31.52, -29.26], [31.33, -29.4], [30.9, -29.91], [30.62, -30.42], [30.06, -31.14], [28.93, -32.17], [28.22, -32.77], [27.46, -33.23], [26.42, -33.61], [25.91, -33.67], [25.78, -33.94], [25.17, -33.8], [24.68, -33.99], [23.59, -33.79], [22.99, -33.92], [22.57, -33.86], [21.54, -34.26], [20.69, -34.42], [20.07, -34.8], [19.62, -34.82], [19.19, -34.46], [18.86, -34.44], [18.42, -34], [18.38, -34.14], [18.24, -33.87], [18.25, -33.28], [17.93, -32.61], [18.25, -32.43], [18.22, -31.66], [17.57, -30.73], [17.06, -29.88], [17.06, -29.88], [16.34, -28.58]], [[28.98, -28.96], [28.54, -28.65], [28.07, -28.85], [27.53, -29.24], [27, -29.88], [27.75, -30.65], [28.11, -30.55], [28.29, -30.23], [28.85, -30.07], [29.02, -29.74], [29.33, -29.26], [28.98, -28.96]]] } }, { type: "Feature", properties: { iso3: "LSO", имя: "Лесото", имя_en: "Lesotho", регион: "Southern Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[28.98, -28.96], [29.33, -29.26], [29.02, -29.74], [28.85, -30.07], [28.29, -30.23], [28.11, -30.55], [27.75, -30.65], [27, -29.88], [27.53, -29.24], [28.07, -28.85], [28.54, -28.65], [28.98, -28.96]]] } }, { type: "Feature", properties: { iso3: "MEX", имя: "Мексика", имя_en: "Mexico", регион: "Central America", континент: "North America" }, geometry: { type: "Polygon", coordinates: [[[-117.13, 32.54], [-115.99, 32.61], [-114.72, 32.72], [-114.81, 32.53], [-113.3, 32.04], [-111.02, 31.33], [-109.03, 31.34], [-108.24, 31.34], [-108.24, 31.75], [-106.51, 31.75], [-106.14, 31.4], [-105.63, 31.08], [-105.04, 30.64], [-104.71, 30.12], [-104.46, 29.57], [-103.94, 29.27], [-103.11, 28.97], [-102.48, 29.76], [-101.66, 29.78], [-100.96, 29.38], [-100.46, 28.7], [-100.11, 28.11], [-99.52, 27.54], [-99.3, 26.84], [-99.02, 26.37], [-98.24, 26.06], [-97.53, 25.84], [-97.14, 25.87], [-97.53, 24.99], [-97.7, 24.27], [-97.78, 22.93], [-97.87, 22.44], [-97.7, 21.9], [-97.39, 21.41], [-97.19, 20.64], [-96.53, 19.89], [-96.29, 19.32], [-95.9, 18.83], [-94.84, 18.56], [-94.43, 18.14], [-93.55, 18.42], [-92.79, 18.52], [-92.04, 18.7], [-91.41, 18.88], [-90.77, 19.28], [-90.53, 19.87], [-90.45, 20.71], [-90.28, 21], [-89.6, 21.26], [-88.54, 21.49], [-87.66, 21.46], [-87.05, 21.54], [-86.81, 21.33], [-86.85, 20.85], [-87.38, 20.26], [-87.62, 19.65], [-87.44, 19.47], [-87.59, 19.04], [-87.84, 18.26], [-88.09, 18.52], [-88.3, 18.5], [-88.49, 18.49], [-88.85, 17.88], [-89.03, 18], [-89.15, 17.96], [-89.14, 17.81], [-90.07, 17.82], [-91, 17.82], [-91, 17.25], [-91.45, 17.25], [-91.08, 16.92], [-90.71, 16.69], [-90.6, 16.47], [-90.44, 16.41], [-90.46, 16.07], [-91.75, 16.07], [-92.23, 15.25], [-92.09, 15.06], [-92.2, 14.83], [-92.23, 14.54], [-93.36, 15.62], [-93.88, 15.94], [-94.69, 16.2], [-95.25, 16.13], [-96.05, 15.75], [-96.56, 15.65], [-97.26, 15.92], [-98.01, 16.11], [-98.95, 16.57], [-99.7, 16.71], [-100.83, 17.17], [-101.67, 17.65], [-101.92, 17.92], [-102.48, 17.98], [-103.5, 18.29], [-103.92, 18.75], [-104.99, 19.32], [-105.49, 19.95], [-105.73, 20.43], [-105.4, 20.53], [-105.5, 20.82], [-105.27, 21.08], [-105.27, 21.42], [-105.6, 21.87], [-105.69, 22.27], [-106.03, 22.77], [-106.91, 23.77], [-107.92, 24.55], [-108.4, 25.17], [-109.26, 25.58], [-109.44, 25.82], [-109.29, 26.44], [-109.8, 26.68], [-110.39, 27.16], [-110.64, 27.86], [-111.18, 27.94], [-111.76, 28.47], [-112.23, 28.95], [-112.27, 29.27], [-112.81, 30.02], [-113.16, 30.79], [-113.15, 31.17], [-113.87, 31.57], [-114.21, 31.52], [-114.78, 31.8], [-114.94, 31.39], [-114.77, 30.91], [-114.67, 30.16], [-114.33, 29.75], [-113.59, 29.06], [-113.42, 28.83], [-113.27, 28.75], [-113.14, 28.41], [-112.96, 28.43], [-112.76, 27.78], [-112.46, 27.53], [-112.24, 27.17], [-111.62, 26.66], [-111.28, 25.73], [-110.99, 25.29], [-110.71, 24.83], [-110.66, 24.3], [-110.17, 24.27], [-109.77, 23.81], [-109.41, 23.36], [-109.43, 23.19], [-109.85, 22.82], [-110.03, 22.82], [-110.3, 23.43], [-110.95, 24], [-111.67, 24.48], [-112.18, 24.74], [-112.15, 25.47], [-112.3, 26.01], [-112.78, 26.32], [-113.46, 26.77], [-113.6, 26.64], [-113.85, 26.9], [-114.47, 27.14], [-115.06, 27.72], [-114.98, 27.8], [-114.57, 27.74], [-114.2, 28.12], [-114.16, 28.57], [-114.93, 29.28], [-115.52, 29.56], [-115.89, 30.18], [-116.26, 30.84], [-116.72, 31.64], [-117.13, 32.54]]] } }, { type: "Feature", properties: { iso3: "URY", имя: "Уругвай", имя_en: "Uruguay", регион: "South America", континент: "South America" }, geometry: { type: "Polygon", coordinates: [[[-57.63, -30.22], [-56.98, -30.11], [-55.97, -30.88], [-55.6, -30.85], [-54.57, -31.49], [-53.79, -32.05], [-53.21, -32.73], [-53.65, -33.2], [-53.37, -33.77], [-53.81, -34.4], [-54.94, -34.95], [-55.67, -34.75], [-56.22, -34.86], [-57.14, -34.43], [-57.82, -34.46], [-58.43, -33.91], [-58.35, -33.26], [-58.13, -33.04], [-58.14, -32.04], [-57.87, -31.02], [-57.63, -30.22]]] } }, { type: "Feature", properties: { iso3: "BRA", имя: "Бразилия", имя_en: "Brazil", регион: "South America", континент: "South America" }, geometry: { type: "Polygon", coordinates: [[[-53.37, -33.77], [-53.65, -33.2], [-53.21, -32.73], [-53.79, -32.05], [-54.57, -31.49], [-55.6, -30.85], [-55.97, -30.88], [-56.98, -30.11], [-57.63, -30.22], [-56.29, -28.85], [-55.16, -27.88], [-54.49, -27.47], [-53.65, -26.92], [-53.63, -26.12], [-54.13, -25.55], [-54.63, -25.74], [-54.43, -25.16], [-54.29, -24.57], [-54.29, -24.02], [-54.65, -23.84], [-55.03, -24], [-55.4, -23.96], [-55.52, -23.57], [-55.61, -22.66], [-55.8, -22.36], [-56.47, -22.09], [-56.88, -22.28], [-57.94, -22.09], [-57.87, -20.73], [-58.17, -20.18], [-57.85, -19.97], [-57.95, -19.4], [-57.68, -18.96], [-57.5, -18.17], [-57.73, -17.55], [-58.28, -17.27], [-58.39, -16.88], [-58.24, -16.3], [-60.16, -16.26], [-60.54, -15.09], [-60.25, -15.08], [-60.26, -14.65], [-60.46, -14.35], [-60.5, -13.78], [-61.08, -13.48], [-61.71, -13.49], [-62.13, -13.2], [-62.8, -13], [-63.2, -12.63], [-64.32, -12.46], [-65.4, -11.57], [-65.32, -10.9], [-65.44, -10.51], [-65.34, -9.76], [-66.65, -9.93], [-67.17, -10.31], [-68.05, -10.71], [-68.27, -11.01], [-68.79, -11.04], [-69.53, -10.95], [-70.09, -11.12], [-70.55, -11.01], [-70.48, -9.49], [-71.3, -10.08], [-72.18, -10.05], [-72.56, -9.52], [-73.23, -9.46], [-73.02, -9.03], [-73.57, -8.42], [-73.99, -7.52], [-73.72, -7.34], [-73.72, -6.92], [-73.12, -6.63], [-73.22, -6.09], [-72.96, -5.74], [-72.89, -5.27], [-71.75, -4.59], [-70.93, -4.4], [-70.79, -4.25], [-69.89, -4.3], [-69.44, -1.56], [-69.42, -1.12], [-69.58, -0.55], [-70.02, -0.19], [-70.02, 0.54], [-69.45, 0.71], [-69.25, 0.6], [-69.22, 0.99], [-69.8, 1.09], [-69.82, 1.71], [-67.87, 1.69], [-67.54, 2.04], [-67.26, 1.72], [-67.07, 1.13], [-66.88, 1.25], [-66.33, 0.72], [-65.55, 0.79], [-65.35, 1.1], [-64.61, 1.33], [-64.2, 1.49], [-64.08, 1.92], [-63.37, 2.2], [-63.42, 2.41], [-64.27, 2.5], [-64.41, 3.13], [-64.37, 3.8], [-64.82, 4.06], [-64.63, 4.15], [-63.89, 4.02], [-63.09, 3.77], [-62.8, 4.01], [-62.09, 4.16], [-60.97, 4.54], [-60.6, 4.92], [-60.73, 5.2], [-60.21, 5.24], [-59.98, 5.01], [-60.11, 4.57], [-59.77, 4.42], [-59.54, 3.96], [-59.82, 3.61], [-59.97, 2.76], [-59.72, 2.25], [-59.65, 1.79], [-59.03, 1.32], [-58.54, 1.27], [-58.43, 1.46], [-58.11, 1.51], [-57.66, 1.68], [-57.34, 1.95], [-56.78, 1.86], [-56.54, 1.9], [-56, 1.82], [-55.91, 2.02], [-56.07, 2.22], [-55.97, 2.51], [-55.57, 2.42], [-55.1, 2.52], [-54.52, 2.31], [-54.09, 2.11], [-53.78, 2.38], [-53.55, 2.33], [-53.42, 2.05], [-52.94, 2.12], [-52.56, 2.5], [-52.25, 3.24], [-51.66, 4.16], [-51.32, 4.2], [-51.07, 3.65], [-50.51, 1.9], [-49.97, 1.74], [-49.95, 1.05], [-50.7, 0.22], [-50.39, -0.08], [-48.62, -0.24], [-48.58, -1.24], [-47.82, -0.58], [-46.57, -0.94], [-44.91, -1.55], [-44.42, -2.14], [-44.58, -2.69], [-43.42, -2.38], [-41.47, -2.91], [-39.98, -2.87], [-38.5, -3.7], [-37.22, -4.82], [-36.45, -5.11], [-35.6, -5.15], [-35.24, -5.46], [-34.9, -6.74], [-34.73, -7.34], [-35.13, -9], [-35.64, -9.65], [-37.05, -11.04], [-37.68, -12.17], [-38.42, -13.04], [-38.67, -13.06], [-38.95, -13.79], [-38.88, -15.67], [-39.16, -17.21], [-39.27, -17.87], [-39.58, -18.26], [-39.76, -19.6], [-40.77, -20.9], [-40.94, -21.94], [-41.75, -22.37], [-41.99, -22.97], [-43.07, -22.97], [-44.65, -23.35], [-45.35, -23.8], [-46.47, -24.09], [-47.65, -24.89], [-48.5, -25.88], [-48.64, -26.62], [-48.47, -27.18], [-48.66, -28.19], [-48.89, -28.67], [-49.59, -29.22], [-50.7, -30.98], [-51.58, -31.78], [-52.26, -32.25], [-52.71, -33.2], [-53.37, -33.77]]] } }, { type: "Feature", properties: { iso3: "BOL", имя: "Боливия", имя_en: "Bolivia", регион: "South America", континент: "South America" }, geometry: { type: "Polygon", coordinates: [[[-69.53, -10.95], [-68.79, -11.04], [-68.27, -11.01], [-68.05, -10.71], [-67.17, -10.31], [-66.65, -9.93], [-65.34, -9.76], [-65.44, -10.51], [-65.32, -10.9], [-65.4, -11.57], [-64.32, -12.46], [-63.2, -12.63], [-62.8, -13], [-62.13, -13.2], [-61.71, -13.49], [-61.08, -13.48], [-60.5, -13.78], [-60.46, -14.35], [-60.26, -14.65], [-60.25, -15.08], [-60.54, -15.09], [-60.16, -16.26], [-58.24, -16.3], [-58.39, -16.88], [-58.28, -17.27], [-57.73, -17.55], [-57.5, -18.17], [-57.68, -18.96], [-57.95, -19.4], [-57.85, -19.97], [-58.17, -20.18], [-58.18, -19.87], [-59.12, -19.36], [-60.04, -19.34], [-61.79, -19.63], [-62.27, -20.51], [-62.29, -21.05], [-62.69, -22.25], [-62.85, -22.03], [-63.99, -21.99], [-64.38, -22.8], [-64.96, -22.08], [-66.27, -21.83], [-67.11, -22.74], [-67.83, -22.87], [-68.22, -21.49], [-68.76, -20.37], [-68.44, -19.41], [-68.97, -18.98], [-69.1, -18.26], [-69.59, -17.58], [-68.96, -16.5], [-69.39, -15.66], [-69.16, -15.32], [-69.34, -14.95], [-68.95, -14.45], [-68.93, -13.6], [-68.88, -12.9], [-68.67, -12.56], [-69.53, -10.95]]] } }, { type: "Feature", properties: { iso3: "PER", имя: "Перу", имя_en: "Peru", регион: "South America", континент: "South America" }, geometry: { type: "Polygon", coordinates: [[[-69.89, -4.3], [-70.79, -4.25], [-70.93, -4.4], [-71.75, -4.59], [-72.89, -5.27], [-72.96, -5.74], [-73.22, -6.09], [-73.12, -6.63], [-73.72, -6.92], [-73.72, -7.34], [-73.99, -7.52], [-73.57, -8.42], [-73.02, -9.03], [-73.23, -9.46], [-72.56, -9.52], [-72.18, -10.05], [-71.3, -10.08], [-70.48, -9.49], [-70.55, -11.01], [-70.09, -11.12], [-69.53, -10.95], [-68.67, -12.56], [-68.88, -12.9], [-68.93, -13.6], [-68.95, -14.45], [-69.34, -14.95], [-69.16, -15.32], [-69.39, -15.66], [-68.96, -16.5], [-69.59, -17.58], [-69.86, -18.09], [-70.37, -18.35], [-71.38, -17.77], [-71.46, -17.36], [-73.44, -16.36], [-75.24, -15.27], [-76.01, -14.65], [-76.42, -13.82], [-76.26, -13.54], [-77.11, -12.22], [-78.09, -10.38], [-79.04, -8.39], [-79.45, -7.93], [-79.76, -7.19], [-80.54, -6.54], [-81.25, -6.14], [-80.93, -5.69], [-81.41, -4.74], [-81.1, -4.04], [-80.3, -3.4], [-80.18, -3.82], [-80.47, -4.06], [-80.44, -4.43], [-80.03, -4.35], [-79.62, -4.45], [-79.21, -4.96], [-78.64, -4.55], [-78.45, -3.87], [-77.84, -3], [-76.64, -2.61], [-75.54, -1.56], [-75.23, -0.91], [-75.37, -0.15], [-75.11, -0.06], [-74.44, -0.53], [-74.12, -1], [-73.66, -1.26], [-73.07, -2.31], [-72.33, -2.43], [-71.77, -2.17], [-71.41, -2.34], [-70.81, -2.26], [-70.05, -2.73], [-70.69, -3.74], [-70.39, -3.77], [-69.89, -4.3]]] } }, { type: "Feature", properties: { iso3: "COL", имя: "Колумбия", имя_en: "Colombia", регион: "South America", континент: "South America" }, geometry: { type: "Polygon", coordinates: [[[-66.88, 1.25], [-67.07, 1.13], [-67.26, 1.72], [-67.54, 2.04], [-67.87, 1.69], [-69.82, 1.71], [-69.8, 1.09], [-69.22, 0.99], [-69.25, 0.6], [-69.45, 0.71], [-70.02, 0.54], [-70.02, -0.19], [-69.58, -0.55], [-69.42, -1.12], [-69.44, -1.56], [-69.89, -4.3], [-70.39, -3.77], [-70.69, -3.74], [-70.05, -2.73], [-70.81, -2.26], [-71.41, -2.34], [-71.77, -2.17], [-72.33, -2.43], [-73.07, -2.31], [-73.66, -1.26], [-74.12, -1], [-74.44, -0.53], [-75.11, -0.06], [-75.37, -0.15], [-75.8, 0.08], [-76.29, 0.42], [-76.58, 0.26], [-77.42, 0.4], [-77.67, 0.83], [-77.86, 0.81], [-78.86, 1.38], [-78.99, 1.69], [-78.62, 1.77], [-78.66, 2.27], [-78.43, 2.63], [-77.93, 2.7], [-77.51, 3.33], [-77.13, 3.85], [-77.5, 4.09], [-77.31, 4.67], [-77.53, 5.58], [-77.32, 5.85], [-77.48, 6.69], [-77.88, 7.22], [-77.75, 7.71], [-77.43, 7.64], [-77.24, 7.94], [-77.47, 8.52], [-77.35, 8.67], [-76.84, 8.64], [-76.09, 9.34], [-75.67, 9.44], [-75.66, 9.77], [-75.48, 10.62], [-74.91, 11.08], [-74.28, 11.1], [-74.2, 11.31], [-73.41, 11.23], [-72.63, 11.73], [-72.24, 11.96], [-71.75, 12.44], [-71.4, 12.38], [-71.14, 12.11], [-71.33, 11.78], [-71.97, 11.61], [-72.23, 11.11], [-72.61, 10.82], [-72.91, 10.45], [-73.03, 9.74], [-73.3, 9.15], [-72.79, 9.09], [-72.66, 8.63], [-72.44, 8.41], [-72.36, 8], [-72.48, 7.63], [-72.44, 7.42], [-72.2, 7.34], [-71.96, 6.99], [-70.67, 7.09], [-70.09, 6.96], [-69.39, 6.1], [-68.99, 6.21], [-68.27, 6.15], [-67.7, 6.27], [-67.34, 6.1], [-67.52, 5.56], [-67.74, 5.22], [-67.82, 4.5], [-67.62, 3.84], [-67.34, 3.54], [-67.3, 3.32], [-67.81, 2.82], [-67.45, 2.6], [-67.18, 2.25], [-66.88, 1.25]]] } }, { type: "Feature", properties: { iso3: "PAN", имя: "Панама", имя_en: "Panama", регион: "Central America", континент: "North America" }, geometry: { type: "Polygon", coordinates: [[[-77.35, 8.67], [-77.47, 8.52], [-77.24, 7.94], [-77.43, 7.64], [-77.75, 7.71], [-77.88, 7.22], [-78.21, 7.51], [-78.43, 8.05], [-78.18, 8.32], [-78.44, 8.39], [-78.62, 8.72], [-79.12, 9], [-79.56, 8.93], [-79.76, 8.58], [-80.16, 8.33], [-80.38, 8.3], [-80.48, 8.09], [-80, 7.55], [-80.28, 7.42], [-80.42, 7.27], [-80.89, 7.22], [-81.06, 7.82], [-81.19, 7.65], [-81.52, 7.71], [-81.72, 8.11], [-82.13, 8.18], [-82.39, 8.29], [-82.82, 8.29], [-82.85, 8.07], [-82.97, 8.23], [-82.91, 8.42], [-82.83, 8.63], [-82.87, 8.81], [-82.72, 8.93], [-82.93, 9.07], [-82.93, 9.48], [-82.55, 9.57], [-82.19, 9.21], [-82.21, 9], [-81.81, 8.95], [-81.71, 9.03], [-81.44, 8.79], [-80.95, 8.86], [-80.52, 9.11], [-79.91, 9.31], [-79.57, 9.61], [-79.02, 9.55], [-79.06, 9.45], [-78.5, 9.42], [-78.06, 9.25], [-77.73, 8.95], [-77.35, 8.67]]] } }, { type: "Feature", properties: { iso3: "CRI", имя: "Коста-Рика", имя_en: "Costa Rica", регион: "Central America", континент: "North America" }, geometry: { type: "Polygon", coordinates: [[[-82.55, 9.57], [-82.93, 9.48], [-82.93, 9.07], [-82.72, 8.93], [-82.87, 8.81], [-82.83, 8.63], [-82.91, 8.42], [-82.97, 8.23], [-83.51, 8.45], [-83.71, 8.66], [-83.6, 8.83], [-83.63, 9.05], [-83.91, 9.29], [-84.3, 9.49], [-84.65, 9.62], [-84.71, 9.91], [-84.98, 10.09], [-84.91, 9.8], [-85.11, 9.56], [-85.34, 9.83], [-85.66, 9.93], [-85.8, 10.13], [-85.79, 10.44], [-85.66, 10.75], [-85.94, 10.9], [-85.71, 11.09], [-85.56, 11.22], [-84.9, 10.95], [-84.67, 11.08], [-84.36, 11], [-84.19, 10.79], [-83.9, 10.73], [-83.66, 10.94], [-83.4, 10.4], [-83.02, 9.99], [-82.55, 9.57]]] } }, { type: "Feature", properties: { iso3: "NIC", имя: "Никарагуа", имя_en: "Nicaragua", регион: "Central America", континент: "North America" }, geometry: { type: "Polygon", coordinates: [[[-83.66, 10.94], [-83.9, 10.73], [-84.19, 10.79], [-84.36, 11], [-84.67, 11.08], [-84.9, 10.95], [-85.56, 11.22], [-85.71, 11.09], [-86.06, 11.4], [-86.53, 11.81], [-86.75, 12.14], [-87.17, 12.46], [-87.67, 12.91], [-87.56, 13.06], [-87.39, 12.91], [-87.32, 12.98], [-87.01, 13.03], [-86.88, 13.25], [-86.73, 13.26], [-86.76, 13.75], [-86.52, 13.78], [-86.31, 13.77], [-86.1, 14.04], [-85.8, 13.84], [-85.7, 13.96], [-85.51, 14.08], [-85.17, 14.35], [-85.15, 14.56], [-85.05, 14.55], [-84.92, 14.79], [-84.82, 14.82], [-84.65, 14.67], [-84.45, 14.62], [-84.23, 14.75], [-83.98, 14.75], [-83.63, 14.88], [-83.49, 15.02], [-83.15, 15], [-83.23, 14.9], [-83.28, 14.68], [-83.18, 14.31], [-83.41, 13.97], [-83.52, 13.57], [-83.55, 13.13], [-83.5, 12.87], [-83.47, 12.42], [-83.63, 12.32], [-83.72, 11.89], [-83.65, 11.63], [-83.86, 11.37], [-83.81, 11.1], [-83.66, 10.94]]] } }, { type: "Feature", properties: { iso3: "HND", имя: "Гондурас", имя_en: "Honduras", регион: "Central America", континент: "North America" }, geometry: { type: "Polygon", coordinates: [[[-83.15, 15], [-83.49, 15.02], [-83.63, 14.88], [-83.98, 14.75], [-84.23, 14.75], [-84.45, 14.62], [-84.65, 14.67], [-84.82, 14.82], [-84.92, 14.79], [-85.05, 14.55], [-85.15, 14.56], [-85.17, 14.35], [-85.51, 14.08], [-85.7, 13.96], [-85.8, 13.84], [-86.1, 14.04], [-86.31, 13.77], [-86.52, 13.78], [-86.76, 13.75], [-86.73, 13.26], [-86.88, 13.25], [-87.01, 13.03], [-87.32, 12.98], [-87.49, 13.3], [-87.79, 13.38], [-87.72, 13.79], [-87.86, 13.89], [-88.07, 13.96], [-88.5, 13.85], [-88.54, 13.98], [-88.84, 14.14], [-89.06, 14.34], [-89.35, 14.42], [-89.15, 14.68], [-89.23, 14.87], [-89.15, 15.07], [-88.68, 15.35], [-88.23, 15.73], [-88.12, 15.69], [-87.9, 15.86], [-87.62, 15.88], [-87.52, 15.8], [-87.37, 15.85], [-86.9, 15.76], [-86.44, 15.78], [-86.12, 15.89], [-86, 16.01], [-85.68, 15.95], [-85.44, 15.89], [-85.18, 15.91], [-84.98, 16], [-84.53, 15.86], [-84.37, 15.84], [-84.06, 15.65], [-83.77, 15.42], [-83.41, 15.27], [-83.15, 15]]] } }, { type: "Feature", properties: { iso3: "SLV", имя: "Сальвадор", имя_en: "El Salvador", регион: "Central America", континент: "North America" }, geometry: { type: "Polygon", coordinates: [[[-89.35, 14.42], [-89.06, 14.34], [-88.84, 14.14], [-88.54, 13.98], [-88.5, 13.85], [-88.07, 13.96], [-87.86, 13.89], [-87.72, 13.79], [-87.79, 13.38], [-87.9, 13.15], [-88.48, 13.16], [-88.84, 13.26], [-89.26, 13.46], [-89.81, 13.52], [-90.1, 13.74], [-90.06, 13.88], [-89.72, 14.13], [-89.53, 14.24], [-89.59, 14.36], [-89.35, 14.42]]] } }, { type: "Feature", properties: { iso3: "GTM", имя: "Гватемала", имя_en: "Guatemala", регион: "Central America", континент: "North America" }, geometry: { type: "Polygon", coordinates: [[[-92.23, 14.54], [-92.2, 14.83], [-92.09, 15.06], [-92.23, 15.25], [-91.75, 16.07], [-90.46, 16.07], [-90.44, 16.41], [-90.6, 16.47], [-90.71, 16.69], [-91.08, 16.92], [-91.45, 17.25], [-91, 17.25], [-91, 17.82], [-90.07, 17.82], [-89.14, 17.81], [-89.15, 17.02], [-89.23, 15.89], [-88.93, 15.89], [-88.6, 15.71], [-88.52, 15.86], [-88.23, 15.73], [-88.68, 15.35], [-89.15, 15.07], [-89.23, 14.87], [-89.15, 14.68], [-89.35, 14.42], [-89.59, 14.36], [-89.53, 14.24], [-89.72, 14.13], [-90.06, 13.88], [-90.1, 13.74], [-90.61, 13.91], [-91.23, 13.93], [-91.69, 14.13], [-92.23, 14.54]]] } }, { type: "Feature", properties: { iso3: "BLZ", имя: "Белиз", имя_en: "Belize", регион: "Central America", континент: "North America" }, geometry: { type: "Polygon", coordinates: [[[-89.14, 17.81], [-89.15, 17.96], [-89.03, 18], [-88.85, 17.88], [-88.49, 18.49], [-88.3, 18.5], [-88.3, 18.35], [-88.11, 18.35], [-88.12, 18.08], [-88.29, 17.64], [-88.2, 17.49], [-88.3, 17.13], [-88.24, 17.04], [-88.36, 16.53], [-88.55, 16.27], [-88.73, 16.23], [-88.93, 15.89], [-89.23, 15.89], [-89.15, 17.02], [-89.14, 17.81]]] } }, { type: "Feature", properties: { iso3: "VEN", имя: "Венесуэла", имя_en: "Venezuela", регион: "South America", континент: "South America" }, geometry: { type: "Polygon", coordinates: [[[-60.73, 5.2], [-60.6, 4.92], [-60.97, 4.54], [-62.09, 4.16], [-62.8, 4.01], [-63.09, 3.77], [-63.89, 4.02], [-64.63, 4.15], [-64.82, 4.06], [-64.37, 3.8], [-64.41, 3.13], [-64.27, 2.5], [-63.42, 2.41], [-63.37, 2.2], [-64.08, 1.92], [-64.2, 1.49], [-64.61, 1.33], [-65.35, 1.1], [-65.55, 0.79], [-66.33, 0.72], [-66.88, 1.25], [-67.18, 2.25], [-67.45, 2.6], [-67.81, 2.82], [-67.3, 3.32], [-67.34, 3.54], [-67.62, 3.84], [-67.82, 4.5], [-67.74, 5.22], [-67.52, 5.56], [-67.34, 6.1], [-67.7, 6.27], [-68.27, 6.15], [-68.99, 6.21], [-69.39, 6.1], [-70.09, 6.96], [-70.67, 7.09], [-71.96, 6.99], [-72.2, 7.34], [-72.44, 7.42], [-72.48, 7.63], [-72.36, 8], [-72.44, 8.41], [-72.66, 8.63], [-72.79, 9.09], [-73.3, 9.15], [-73.03, 9.74], [-72.91, 10.45], [-72.61, 10.82], [-72.23, 11.11], [-71.97, 11.61], [-71.33, 11.78], [-71.36, 11.54], [-71.95, 11.42], [-71.62, 10.97], [-71.63, 10.45], [-72.07, 9.87], [-71.7, 9.07], [-71.26, 9.14], [-71.04, 9.86], [-71.35, 10.21], [-71.4, 10.97], [-70.16, 11.38], [-70.29, 11.85], [-69.94, 12.16], [-69.58, 11.46], [-68.88, 11.44], [-68.23, 10.89], [-68.19, 10.55], [-67.3, 10.55], [-66.23, 10.65], [-65.66, 10.2], [-64.89, 10.08], [-64.33, 10.39], [-64.32, 10.64], [-63.08, 10.7], [-61.88, 10.72], [-62.73, 10.42], [-62.39, 9.95], [-61.59, 9.87], [-60.83, 9.38], [-60.67, 8.58], [-60.15, 8.6], [-59.76, 8.37], [-60.55, 7.78], [-60.64, 7.42], [-60.3, 7.04], [-60.54, 6.86], [-61.16, 6.7], [-61.14, 6.23], [-61.41, 5.96], [-60.73, 5.2]]] } }, { type: "Feature", properties: { iso3: "GUY", имя: "Гайана", имя_en: "Guyana", регион: "South America", континент: "South America" }, geometry: { type: "Polygon", coordinates: [[[-56.54, 1.9], [-56.78, 1.86], [-57.34, 1.95], [-57.66, 1.68], [-58.11, 1.51], [-58.43, 1.46], [-58.54, 1.27], [-59.03, 1.32], [-59.65, 1.79], [-59.72, 2.25], [-59.97, 2.76], [-59.82, 3.61], [-59.54, 3.96], [-59.77, 4.42], [-60.11, 4.57], [-59.98, 5.01], [-60.21, 5.24], [-60.73, 5.2], [-61.41, 5.96], [-61.14, 6.23], [-61.16, 6.7], [-60.54, 6.86], [-60.3, 7.04], [-60.64, 7.42], [-60.55, 7.78], [-59.76, 8.37], [-59.1, 8], [-58.48, 7.35], [-58.45, 6.83], [-58.08, 6.81], [-57.54, 6.32], [-57.15, 5.97], [-57.31, 5.07], [-57.91, 4.81], [-57.86, 4.58], [-58.04, 4.06], [-57.6, 3.33], [-57.28, 3.33], [-57.15, 2.77], [-56.54, 1.9]]] } }, { type: "Feature", properties: { iso3: "SUR", имя: "Суринам", имя_en: "Suriname", регион: "South America", континент: "South America" }, geometry: { type: "Polygon", coordinates: [[[-54.52, 2.31], [-55.1, 2.52], [-55.57, 2.42], [-55.97, 2.51], [-56.07, 2.22], [-55.91, 2.02], [-56, 1.82], [-56.54, 1.9], [-57.15, 2.77], [-57.28, 3.33], [-57.6, 3.33], [-58.04, 4.06], [-57.86, 4.58], [-57.91, 4.81], [-57.31, 5.07], [-57.15, 5.97], [-55.95, 5.77], [-55.84, 5.95], [-55.03, 6.03], [-53.96, 5.76], [-54.48, 4.9], [-54.4, 4.21], [-54.01, 3.62], [-54.18, 3.19], [-54.27, 2.73], [-54.52, 2.31]]] } }, { type: "Feature", properties: { iso3: "FRA", имя: "Франция", имя_en: "France", регион: "Western Europe", континент: "Europe" }, geometry: { type: "MultiPolygon", coordinates: [[[[-51.66, 4.16], [-52.25, 3.24], [-52.56, 2.5], [-52.94, 2.12], [-53.42, 2.05], [-53.55, 2.33], [-53.78, 2.38], [-54.09, 2.11], [-54.52, 2.31], [-54.27, 2.73], [-54.18, 3.19], [-54.01, 3.62], [-54.4, 4.21], [-54.48, 4.9], [-53.96, 5.76], [-53.62, 5.65], [-52.88, 5.41], [-51.82, 4.57], [-51.66, 4.16]]], [[[6.19, 49.46], [6.66, 49.2], [8.1, 49.02], [7.59, 48.33], [7.47, 47.62], [7.19, 47.45], [6.74, 47.54], [6.77, 47.29], [6.04, 46.73], [6.02, 46.27], [6.5, 46.43], [6.84, 45.99], [6.8, 45.71], [7.1, 45.33], [6.75, 45.03], [7.01, 44.25], [7.55, 44.13], [7.44, 43.69], [6.53, 43.13], [4.56, 43.4], [3.1, 43.08], [2.99, 42.47], [1.83, 42.34], [0.7, 42.8], [0.34, 42.58], [-1.5, 43.03], [-1.9, 43.42], [-1.38, 44.02], [-1.19, 46.01], [-2.23, 47.06], [-2.96, 47.57], [-4.49, 47.95], [-4.59, 48.68], [-3.3, 48.9], [-1.62, 48.64], [-1.93, 49.78], [-0.99, 49.35], [1.34, 50.13], [1.64, 50.95], [2.51, 51.15], [2.66, 50.8], [3.12, 50.78], [3.59, 50.38], [4.29, 49.91], [4.8, 49.99], [5.67, 49.53], [5.9, 49.44], [6.19, 49.46]]], [[[8.75, 42.63], [9.39, 43.01], [9.56, 42.15], [9.23, 41.38], [8.78, 41.58], [8.54, 42.26], [8.75, 42.63]]]] } }, { type: "Feature", properties: { iso3: "ECU", имя: "Эквадор", имя_en: "Ecuador", регион: "South America", континент: "South America" }, geometry: { type: "Polygon", coordinates: [[[-75.37, -0.15], [-75.23, -0.91], [-75.54, -1.56], [-76.64, -2.61], [-77.84, -3], [-78.45, -3.87], [-78.64, -4.55], [-79.21, -4.96], [-79.62, -4.45], [-80.03, -4.35], [-80.44, -4.43], [-80.47, -4.06], [-80.18, -3.82], [-80.3, -3.4], [-79.77, -2.66], [-79.99, -2.22], [-80.37, -2.69], [-80.97, -2.25], [-80.76, -1.97], [-80.93, -1.06], [-80.58, -0.91], [-80.4, -0.28], [-80.02, 0.36], [-80.09, 0.77], [-79.54, 0.98], [-78.86, 1.38], [-77.86, 0.81], [-77.67, 0.83], [-77.42, 0.4], [-76.58, 0.26], [-76.29, 0.42], [-75.8, 0.08], [-75.37, -0.15]]] } }, { type: "Feature", properties: { iso3: "PRI", имя: "Пуэрто-Рико", имя_en: "Puerto Rico", регион: "Caribbean", континент: "North America" }, geometry: { type: "Polygon", coordinates: [[[-66.28, 18.51], [-65.77, 18.43], [-65.59, 18.23], [-65.85, 17.98], [-66.6, 17.98], [-67.18, 17.95], [-67.24, 18.37], [-67.1, 18.52], [-66.28, 18.51]]] } }, { type: "Feature", properties: { iso3: "JAM", имя: "Ямайка", имя_en: "Jamaica", регион: "Caribbean", континент: "North America" }, geometry: { type: "Polygon", coordinates: [[[-77.57, 18.49], [-76.9, 18.4], [-76.37, 18.16], [-76.2, 17.89], [-76.9, 17.87], [-77.21, 17.7], [-77.77, 17.86], [-78.34, 18.23], [-78.22, 18.45], [-77.8, 18.52], [-77.57, 18.49]]] } }, { type: "Feature", properties: { iso3: "CUB", имя: "Куба", имя_en: "Cuba", регион: "Caribbean", континент: "North America" }, geometry: { type: "Polygon", coordinates: [[[-82.27, 23.19], [-81.4, 23.12], [-80.62, 23.11], [-79.68, 22.77], [-79.28, 22.4], [-78.35, 22.51], [-77.99, 22.28], [-77.15, 21.66], [-76.52, 21.21], [-76.19, 21.22], [-75.6, 21.02], [-75.67, 20.74], [-74.93, 20.69], [-74.18, 20.28], [-74.3, 20.05], [-74.96, 19.92], [-75.63, 19.87], [-76.32, 19.95], [-77.76, 19.86], [-77.09, 20.41], [-77.49, 20.67], [-78.14, 20.74], [-78.48, 21.03], [-78.72, 21.6], [-79.28, 21.56], [-80.22, 21.83], [-80.52, 22.04], [-81.82, 22.19], [-82.17, 22.39], [-81.8, 22.64], [-82.78, 22.69], [-83.49, 22.17], [-83.91, 22.15], [-84.05, 21.91], [-84.55, 21.8], [-84.97, 21.9], [-84.45, 22.2], [-84.23, 22.57], [-83.78, 22.79], [-83.27, 22.98], [-82.51, 23.08], [-82.27, 23.19]]] } }, { type: "Feature", properties: { iso3: "ZWE", имя: "Зимбабве", имя_en: "Zimbabwe", регион: "Eastern Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[31.19, -22.25], [30.66, -22.15], [30.32, -22.27], [29.84, -22.1], [29.43, -22.09], [28.79, -21.64], [28.02, -21.49], [27.73, -20.85], [27.72, -20.5], [27.3, -20.39], [26.16, -19.29], [25.85, -18.71], [25.65, -18.54], [25.26, -17.74], [26.38, -17.85], [26.71, -17.96], [27.04, -17.94], [27.6, -17.29], [28.47, -16.47], [28.83, -16.39], [28.95, -16.04], [29.52, -15.64], [30.27, -15.51], [30.34, -15.88], [31.17, -15.86], [31.64, -16.07], [31.85, -16.32], [32.33, -16.39], [32.85, -16.71], [32.85, -17.98], [32.65, -18.67], [32.61, -19.42], [32.77, -19.72], [32.66, -20.3], [32.51, -20.4], [32.24, -21.12], [31.19, -22.25]]] } }, { type: "Feature", properties: { iso3: "BWA", имя: "Ботсвана", имя_en: "Botswana", регион: "Southern Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[29.43, -22.09], [28.02, -22.83], [27.12, -23.57], [26.79, -24.24], [26.49, -24.62], [25.94, -24.7], [25.77, -25.17], [25.66, -25.49], [25.03, -25.72], [24.21, -25.67], [23.73, -25.39], [23.31, -25.27], [22.82, -25.5], [22.58, -25.98], [22.11, -26.28], [21.61, -26.73], [20.89, -26.83], [20.67, -26.48], [20.76, -25.87], [20.17, -24.92], [19.9, -24.77], [19.9, -21.85], [20.88, -21.81], [20.91, -18.25], [21.66, -18.22], [23.2, -17.87], [23.58, -18.28], [24.22, -17.89], [24.52, -17.89], [25.08, -17.66], [25.26, -17.74], [25.65, -18.54], [25.85, -18.71], [26.16, -19.29], [27.3, -20.39], [27.72, -20.5], [27.73, -20.85], [28.02, -21.49], [28.79, -21.64], [29.43, -22.09]]] } }, { type: "Feature", properties: { iso3: "NAM", имя: "Намибия", имя_en: "Namibia", регион: "Southern Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[19.9, -24.77], [19.89, -28.46], [19, -28.97], [18.46, -29.05], [17.84, -28.86], [17.39, -28.78], [17.22, -28.36], [16.82, -28.08], [16.34, -28.58], [15.6, -27.82], [15.21, -27.09], [14.99, -26.12], [14.74, -25.39], [14.41, -23.85], [14.39, -22.66], [14.26, -22.11], [13.87, -21.7], [13.35, -20.87], [12.83, -19.67], [12.61, -19.05], [11.79, -18.07], [11.73, -17.3], [12.22, -17.11], [12.81, -16.94], [13.46, -16.97], [14.06, -17.42], [14.21, -17.35], [18.26, -17.31], [18.96, -17.79], [21.38, -17.93], [23.22, -17.52], [24.03, -17.3], [24.68, -17.35], [25.08, -17.58], [25.08, -17.66], [24.52, -17.89], [24.22, -17.89], [23.58, -18.28], [23.2, -17.87], [21.66, -18.22], [20.91, -18.25], [20.88, -21.81], [19.9, -21.85], [19.9, -24.77]]] } }, { type: "Feature", properties: { iso3: "SEN", имя: "Сенегал", имя_en: "Senegal", регион: "Western Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[-16.71, 13.59], [-17.13, 14.37], [-17.63, 14.73], [-17.19, 14.92], [-16.7, 15.62], [-16.46, 16.14], [-16.12, 16.46], [-15.62, 16.37], [-15.14, 16.59], [-14.58, 16.6], [-14.1, 16.3], [-13.44, 16.04], [-12.83, 15.3], [-12.17, 14.62], [-12.12, 13.99], [-11.93, 13.42], [-11.55, 13.14], [-11.47, 12.75], [-11.51, 12.44], [-11.66, 12.39], [-12.2, 12.47], [-12.28, 12.35], [-12.5, 12.33], [-13.22, 12.58], [-13.7, 12.59], [-15.55, 12.63], [-15.82, 12.52], [-16.15, 12.55], [-16.68, 12.38], [-16.84, 13.15], [-15.93, 13.13], [-15.69, 13.27], [-15.51, 13.28], [-15.14, 13.51], [-14.71, 13.3], [-14.28, 13.28], [-13.84, 13.51], [-14.05, 13.79], [-14.38, 13.63], [-14.69, 13.63], [-15.08, 13.88], [-15.4, 13.86], [-15.62, 13.62], [-16.71, 13.59]]] } }, { type: "Feature", properties: { iso3: "MLI", имя: "Мали", имя_en: "Mali", регион: "Western Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[-11.51, 12.44], [-11.47, 12.75], [-11.55, 13.14], [-11.93, 13.42], [-12.12, 13.99], [-12.17, 14.62], [-11.83, 14.8], [-11.67, 15.39], [-11.35, 15.41], [-10.65, 15.13], [-10.09, 15.33], [-9.7, 15.26], [-9.55, 15.49], [-5.54, 15.5], [-5.32, 16.2], [-5.49, 16.33], [-5.97, 20.64], [-6.45, 24.96], [-4.92, 24.97], [-1.55, 22.79], [1.82, 20.61], [2.06, 20.14], [2.68, 19.86], [3.15, 19.69], [3.16, 19.06], [4.27, 19.16], [4.27, 16.85], [3.72, 16.18], [3.64, 15.57], [2.75, 15.41], [1.39, 15.32], [1.02, 14.97], [0.37, 14.93], [-0.27, 14.92], [-0.52, 15.12], [-1.07, 14.97], [-2, 14.56], [-2.19, 14.25], [-2.97, 13.8], [-3.1, 13.54], [-3.52, 13.34], [-4.01, 13.47], [-4.28, 13.23], [-4.43, 12.54], [-5.22, 11.71], [-5.2, 11.38], [-5.47, 10.95], [-5.4, 10.37], [-5.82, 10.22], [-6.05, 10.1], [-6.21, 10.52], [-6.49, 10.41], [-6.67, 10.43], [-6.85, 10.14], [-7.62, 10.15], [-7.9, 10.3], [-8.03, 10.21], [-8.34, 10.49], [-8.28, 10.79], [-8.41, 10.91], [-8.62, 10.81], [-8.58, 11.14], [-8.38, 11.39], [-8.79, 11.81], [-8.91, 12.09], [-9.13, 12.31], [-9.33, 12.33], [-9.57, 12.19], [-9.89, 12.06], [-10.17, 11.84], [-10.59, 11.92], [-10.87, 12.18], [-11.04, 12.21], [-11.3, 12.08], [-11.46, 12.08], [-11.51, 12.44]]] } }, { type: "Feature", properties: { iso3: "MRT", имя: "Мавритания", имя_en: "Mauritania", регион: "Western Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[-17.06, 21], [-16.85, 21.33], [-12.93, 21.33], [-13.12, 22.77], [-12.87, 23.28], [-11.94, 23.37], [-11.97, 25.93], [-8.69, 25.88], [-8.68, 27.4], [-4.92, 24.97], [-6.45, 24.96], [-5.97, 20.64], [-5.49, 16.33], [-5.32, 16.2], [-5.54, 15.5], [-9.55, 15.49], [-9.7, 15.26], [-10.09, 15.33], [-10.65, 15.13], [-11.35, 15.41], [-11.67, 15.39], [-11.83, 14.8], [-12.17, 14.62], [-12.83, 15.3], [-13.44, 16.04], [-14.1, 16.3], [-14.58, 16.6], [-15.14, 16.59], [-15.62, 16.37], [-16.12, 16.46], [-16.46, 16.14], [-16.55, 16.67], [-16.27, 17.17], [-16.15, 18.11], [-16.26, 19.1], [-16.38, 19.59], [-16.28, 20.09], [-16.54, 20.57], [-17.06, 21]]] } }, { type: "Feature", properties: { iso3: "BEN", имя: "Бенин", имя_en: "Benin", регион: "Western Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[2.69, 6.26], [1.87, 6.14], [1.62, 6.83], [1.66, 9.13], [1.46, 9.33], [1.43, 9.83], [1.08, 10.18], [0.77, 10.47], [0.9, 11], [1.24, 11.11], [1.45, 11.55], [1.94, 11.64], [2.15, 11.94], [2.49, 12.23], [2.85, 12.24], [3.61, 11.66], [3.57, 11.33], [3.8, 10.73], [3.6, 10.33], [3.71, 10.06], [3.22, 9.44], [2.91, 9.14], [2.72, 8.51], [2.75, 7.87], [2.69, 6.26]]] } }, { type: "Feature", properties: { iso3: "NER", имя: "Нигер", имя_en: "Niger", регион: "Western Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[14.85, 22.86], [15.1, 21.31], [15.47, 21.05], [15.49, 20.73], [15.9, 20.39], [15.69, 19.96], [15.3, 17.93], [15.25, 16.63], [13.97, 15.68], [13.54, 14.37], [13.96, 14], [13.95, 13.35], [14.6, 13.33], [14.5, 12.86], [14.21, 12.8], [14.18, 12.48], [14, 12.46], [13.32, 13.56], [13.08, 13.6], [12.3, 13.04], [11.53, 13.33], [10.99, 13.39], [10.7, 13.25], [10.11, 13.28], [9.52, 12.85], [9.01, 12.83], [7.8, 13.34], [7.33, 13.1], [6.82, 13.12], [6.45, 13.49], [5.44, 13.87], [4.37, 13.75], [4.11, 13.53], [3.97, 12.96], [3.68, 12.55], [3.61, 11.66], [2.85, 12.24], [2.49, 12.23], [2.15, 11.94], [2.18, 12.63], [1.02, 12.85], [0.99, 13.34], [0.43, 13.99], [0.3, 14.44], [0.37, 14.93], [1.02, 14.97], [1.39, 15.32], [2.75, 15.41], [3.64, 15.57], [3.72, 16.18], [4.27, 16.85], [4.27, 19.16], [5.68, 19.6], [8.57, 21.57], [12, 23.47], [13.58, 23.04], [14.14, 22.49], [14.85, 22.86]]] } }, { type: "Feature", properties: { iso3: "NGA", имя: "Нигерия", имя_en: "Nigeria", регион: "Western Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[2.69, 6.26], [2.75, 7.87], [2.72, 8.51], [2.91, 9.14], [3.22, 9.44], [3.71, 10.06], [3.6, 10.33], [3.8, 10.73], [3.57, 11.33], [3.61, 11.66], [3.68, 12.55], [3.97, 12.96], [4.11, 13.53], [4.37, 13.75], [5.44, 13.87], [6.45, 13.49], [6.82, 13.12], [7.33, 13.1], [7.8, 13.34], [9.01, 12.83], [9.52, 12.85], [10.11, 13.28], [10.7, 13.25], [10.99, 13.39], [11.53, 13.33], [12.3, 13.04], [13.08, 13.6], [13.32, 13.56], [14, 12.46], [14.18, 12.48], [14.58, 12.09], [14.47, 11.9], [14.42, 11.57], [13.57, 10.8], [13.31, 10.16], [13.17, 9.64], [12.96, 9.42], [12.75, 8.72], [12.22, 8.31], [12.06, 7.8], [11.84, 7.4], [11.75, 6.98], [11.06, 6.64], [10.5, 7.06], [10.12, 7.04], [9.52, 6.45], [9.23, 6.44], [8.76, 5.48], [8.5, 4.77], [7.46, 4.41], [7.08, 4.46], [6.7, 4.24], [5.9, 4.26], [5.36, 4.89], [5.03, 5.61], [4.33, 6.27], [3.57, 6.26], [2.69, 6.26]]] } }, { type: "Feature", properties: { iso3: "CMR", имя: "Камерун", имя_en: "Cameroon", регион: "Middle Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[14.5, 12.86], [14.89, 12.22], [14.96, 11.56], [14.92, 10.89], [15.47, 9.98], [14.91, 9.99], [14.63, 9.92], [14.17, 10.02], [13.95, 9.55], [14.54, 8.97], [14.98, 8.8], [15.12, 8.38], [15.44, 7.69], [15.28, 7.42], [14.78, 6.41], [14.54, 6.23], [14.46, 5.45], [14.56, 5.03], [14.48, 4.73], [14.95, 4.21], [15.04, 3.85], [15.41, 3.34], [15.86, 3.01], [15.91, 2.56], [16.01, 2.27], [15.94, 1.73], [15.15, 1.96], [14.34, 2.23], [13.08, 2.27], [12.95, 2.32], [12.36, 2.19], [11.75, 2.33], [11.28, 2.26], [9.65, 2.28], [9.8, 3.07], [9.4, 3.73], [8.95, 3.9], [8.74, 4.35], [8.49, 4.5], [8.5, 4.77], [8.76, 5.48], [9.23, 6.44], [9.52, 6.45], [10.12, 7.04], [10.5, 7.06], [11.06, 6.64], [11.75, 6.98], [11.84, 7.4], [12.06, 7.8], [12.22, 8.31], [12.75, 8.72], [12.96, 9.42], [13.17, 9.64], [13.31, 10.16], [13.57, 10.8], [14.42, 11.57], [14.47, 11.9], [14.58, 12.09], [14.18, 12.48], [14.21, 12.8], [14.5, 12.86]]] } }, { type: "Feature", properties: { iso3: "TGO", имя: "Того", имя_en: "Togo", регион: "Western Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[0.9, 11], [0.77, 10.47], [1.08, 10.18], [1.43, 9.83], [1.46, 9.33], [1.66, 9.13], [1.62, 6.83], [1.87, 6.14], [1.06, 5.93], [0.84, 6.28], [0.57, 6.91], [0.49, 7.41], [0.71, 8.31], [0.46, 8.68], [0.37, 9.47], [0.37, 10.19], [-0.05, 10.71], [0.02, 11.02], [0.9, 11]]] } }, { type: "Feature", properties: { iso3: "GHA", имя: "Гана", имя_en: "Ghana", регион: "Western Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[0.02, 11.02], [-0.05, 10.71], [0.37, 10.19], [0.37, 9.47], [0.46, 8.68], [0.71, 8.31], [0.49, 7.41], [0.57, 6.91], [0.84, 6.28], [1.06, 5.93], [-0.51, 5.34], [-1.06, 5], [-1.96, 4.71], [-2.86, 4.99], [-2.81, 5.39], [-3.24, 6.25], [-2.98, 7.38], [-2.56, 8.22], [-2.83, 9.64], [-2.96, 10.4], [-2.94, 10.96], [-1.2, 11.01], [-0.76, 10.94], [-0.44, 11.1], [0.02, 11.02]]] } }, { type: "Feature", properties: { iso3: "CIV", имя: "Кот-д’Ивуар", имя_en: "Côte d'Ivoire", регион: "Western Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[-8.03, 10.21], [-7.9, 10.3], [-7.62, 10.15], [-6.85, 10.14], [-6.67, 10.43], [-6.49, 10.41], [-6.21, 10.52], [-6.05, 10.1], [-5.82, 10.22], [-5.4, 10.37], [-4.95, 10.15], [-4.78, 9.82], [-4.33, 9.61], [-3.98, 9.86], [-3.51, 9.9], [-2.83, 9.64], [-2.56, 8.22], [-2.98, 7.38], [-3.24, 6.25], [-2.81, 5.39], [-2.86, 4.99], [-3.31, 4.98], [-4.01, 5.18], [-4.65, 5.17], [-5.83, 4.99], [-6.53, 4.71], [-7.52, 4.34], [-7.71, 4.36], [-7.64, 5.19], [-7.54, 5.31], [-7.57, 5.71], [-7.99, 6.13], [-8.31, 6.19], [-8.6, 6.47], [-8.39, 6.91], [-8.49, 7.4], [-8.44, 7.69], [-8.28, 7.69], [-8.22, 8.12], [-8.3, 8.32], [-8.2, 8.46], [-7.83, 8.58], [-8.08, 9.38], [-8.31, 9.79], [-8.23, 10.13], [-8.03, 10.21]]] } }, { type: "Feature", properties: { iso3: "GIN", имя: "Гвинея", имя_en: "Guinea", регион: "Western Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[-13.7, 12.59], [-13.22, 12.58], [-12.5, 12.33], [-12.28, 12.35], [-12.2, 12.47], [-11.66, 12.39], [-11.51, 12.44], [-11.46, 12.08], [-11.3, 12.08], [-11.04, 12.21], [-10.87, 12.18], [-10.59, 11.92], [-10.17, 11.84], [-9.89, 12.06], [-9.57, 12.19], [-9.33, 12.33], [-9.13, 12.31], [-8.91, 12.09], [-8.79, 11.81], [-8.38, 11.39], [-8.58, 11.14], [-8.62, 10.81], [-8.41, 10.91], [-8.28, 10.79], [-8.34, 10.49], [-8.03, 10.21], [-8.23, 10.13], [-8.31, 9.79], [-8.08, 9.38], [-7.83, 8.58], [-8.2, 8.46], [-8.3, 8.32], [-8.22, 8.12], [-8.28, 7.69], [-8.44, 7.69], [-8.72, 7.71], [-8.93, 7.31], [-9.21, 7.31], [-9.4, 7.53], [-9.34, 7.93], [-9.76, 8.54], [-10.02, 8.43], [-10.23, 8.41], [-10.51, 8.35], [-10.49, 8.72], [-10.65, 8.98], [-10.62, 9.27], [-10.84, 9.69], [-11.12, 10.05], [-11.92, 10.05], [-12.15, 9.86], [-12.43, 9.84], [-12.6, 9.62], [-12.71, 9.34], [-13.25, 8.9], [-13.69, 9.49], [-14.07, 9.89], [-14.33, 10.02], [-14.58, 10.21], [-14.69, 10.66], [-14.84, 10.88], [-15.13, 11.04], [-14.69, 11.53], [-14.38, 11.51], [-14.12, 11.68], [-13.9, 11.68], [-13.74, 11.81], [-13.83, 12.14], [-13.72, 12.25], [-13.7, 12.59]]] } }, { type: "Feature", properties: { iso3: "GNB", имя: "Гвинея-Бисау", имя_en: "Guinea-Bissau", регион: "Western Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[-16.68, 12.38], [-16.15, 12.55], [-15.82, 12.52], [-15.55, 12.63], [-13.7, 12.59], [-13.72, 12.25], [-13.83, 12.14], [-13.74, 11.81], [-13.9, 11.68], [-14.12, 11.68], [-14.38, 11.51], [-14.69, 11.53], [-15.13, 11.04], [-15.66, 11.46], [-16.09, 11.52], [-16.31, 11.81], [-16.31, 11.96], [-16.61, 12.17], [-16.68, 12.38]]] } }, { type: "Feature", properties: { iso3: "LBR", имя: "Либерия", имя_en: "Liberia", регион: "Western Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[-8.44, 7.69], [-8.49, 7.4], [-8.39, 6.91], [-8.6, 6.47], [-8.31, 6.19], [-7.99, 6.13], [-7.57, 5.71], [-7.54, 5.31], [-7.64, 5.19], [-7.71, 4.36], [-7.97, 4.36], [-9, 4.83], [-9.91, 5.59], [-10.77, 6.14], [-11.44, 6.79], [-11.2, 7.11], [-11.15, 7.4], [-10.7, 7.94], [-10.23, 8.41], [-10.02, 8.43], [-9.76, 8.54], [-9.34, 7.93], [-9.4, 7.53], [-9.21, 7.31], [-8.93, 7.31], [-8.72, 7.71], [-8.44, 7.69]]] } }, { type: "Feature", properties: { iso3: "SLE", имя: "Сьерра-Леоне", имя_en: "Sierra Leone", регион: "Western Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[-13.25, 8.9], [-12.71, 9.34], [-12.6, 9.62], [-12.43, 9.84], [-12.15, 9.86], [-11.92, 10.05], [-11.12, 10.05], [-10.84, 9.69], [-10.62, 9.27], [-10.65, 8.98], [-10.49, 8.72], [-10.51, 8.35], [-10.23, 8.41], [-10.7, 7.94], [-11.15, 7.4], [-11.2, 7.11], [-11.44, 6.79], [-11.71, 6.86], [-12.43, 7.26], [-12.95, 7.8], [-13.12, 8.16], [-13.25, 8.9]]] } }, { type: "Feature", properties: { iso3: "BFA", имя: "Буркина-Фасо", имя_en: "Burkina Faso", регион: "Western Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[-5.4, 10.37], [-5.47, 10.95], [-5.2, 11.38], [-5.22, 11.71], [-4.43, 12.54], [-4.28, 13.23], [-4.01, 13.47], [-3.52, 13.34], [-3.1, 13.54], [-2.97, 13.8], [-2.19, 14.25], [-2, 14.56], [-1.07, 14.97], [-0.52, 15.12], [-0.27, 14.92], [0.37, 14.93], [0.3, 14.44], [0.43, 13.99], [0.99, 13.34], [1.02, 12.85], [2.18, 12.63], [2.15, 11.94], [1.94, 11.64], [1.45, 11.55], [1.24, 11.11], [0.9, 11], [0.02, 11.02], [-0.44, 11.1], [-0.76, 10.94], [-1.2, 11.01], [-2.94, 10.96], [-2.96, 10.4], [-2.83, 9.64], [-3.51, 9.9], [-3.98, 9.86], [-4.33, 9.61], [-4.78, 9.82], [-4.95, 10.15], [-5.4, 10.37]]] } }, { type: "Feature", properties: { iso3: "CAF", имя: "Центральноафриканская Республика", имя_en: "Central African Rep.", регион: "Middle Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[27.37, 5.23], [27.04, 5.13], [26.4, 5.15], [25.65, 5.26], [25.28, 5.17], [25.13, 4.93], [24.81, 4.9], [24.41, 5.11], [23.3, 4.61], [22.84, 4.71], [22.7, 4.63], [22.41, 4.03], [21.66, 4.22], [20.93, 4.32], [20.29, 4.69], [19.47, 5.03], [18.93, 4.71], [18.54, 4.2], [18.45, 3.5], [17.81, 3.56], [17.13, 3.73], [16.54, 3.2], [16.01, 2.27], [15.91, 2.56], [15.86, 3.01], [15.41, 3.34], [15.04, 3.85], [14.95, 4.21], [14.48, 4.73], [14.56, 5.03], [14.46, 5.45], [14.54, 6.23], [14.78, 6.41], [15.28, 7.42], [16.11, 7.5], [16.29, 7.75], [16.46, 7.73], [16.71, 7.51], [17.96, 7.89], [18.39, 8.28], [18.91, 8.63], [18.81, 8.98], [19.09, 9.07], [20.06, 9.01], [21, 9.48], [21.72, 10.57], [22.23, 10.97], [22.86, 11.14], [22.98, 10.71], [23.55, 10.09], [23.56, 9.68], [23.39, 9.27], [23.46, 8.95], [23.81, 8.67], [24.57, 8.23], [25.11, 7.83], [25.12, 7.5], [25.8, 6.98], [26.21, 6.55], [26.47, 5.95], [27.21, 5.55], [27.37, 5.23]]] } }, { type: "Feature", properties: { iso3: "COG", имя: "Республика Конго", имя_en: "Congo", регион: "Middle Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[18.45, 3.5], [18.39, 2.9], [18.09, 2.37], [17.9, 1.74], [17.77, 0.86], [17.83, 0.29], [17.66, -0.06], [17.64, -0.42], [17.52, -0.74], [16.87, -1.23], [16.41, -1.74], [15.97, -2.71], [16.01, -3.54], [15.75, -3.86], [15.17, -4.34], [14.58, -4.97], [14.21, -4.79], [14.14, -4.51], [13.6, -4.5], [13.26, -4.88], [13, -4.78], [12.62, -4.44], [12.32, -4.61], [11.91, -5.04], [11.09, -3.98], [11.86, -3.43], [11.48, -2.77], [11.82, -2.51], [12.5, -2.39], [12.58, -1.95], [13.11, -2.43], [13.99, -2.47], [14.3, -2], [14.43, -1.33], [14.32, -0.55], [13.84, 0.04], [14.28, 1.2], [14.03, 1.4], [13.28, 1.31], [13, 1.83], [13.08, 2.27], [14.34, 2.23], [15.15, 1.96], [15.94, 1.73], [16.01, 2.27], [16.54, 3.2], [17.13, 3.73], [17.81, 3.56], [18.45, 3.5]]] } }, { type: "Feature", properties: { iso3: "GAB", имя: "Габон", имя_en: "Gabon", регион: "Middle Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[11.28, 2.26], [11.75, 2.33], [12.36, 2.19], [12.95, 2.32], [13.08, 2.27], [13, 1.83], [13.28, 1.31], [14.03, 1.4], [14.28, 1.2], [13.84, 0.04], [14.32, -0.55], [14.43, -1.33], [14.3, -2], [13.99, -2.47], [13.11, -2.43], [12.58, -1.95], [12.5, -2.39], [11.82, -2.51], [11.48, -2.77], [11.86, -3.43], [11.09, -3.98], [10.07, -2.97], [9.41, -2.14], [8.8, -1.11], [8.83, -0.78], [9.05, -0.46], [9.29, 0.27], [9.49, 1.01], [9.83, 1.07], [11.29, 1.06], [11.28, 2.26]]] } }, { type: "Feature", properties: { iso3: "GNQ", имя: "Экваториальная Гвинея", имя_en: "Eq. Guinea", регион: "Middle Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[9.65, 2.28], [11.28, 2.26], [11.29, 1.06], [9.83, 1.07], [9.49, 1.01], [9.31, 1.16], [9.65, 2.28]]] } }, { type: "Feature", properties: { iso3: "ZMB", имя: "Замбия", имя_en: "Zambia", регион: "Eastern Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[30.74, -8.34], [31.16, -8.59], [31.56, -8.76], [32.19, -8.93], [32.76, -9.23], [33.23, -9.68], [33.49, -10.53], [33.32, -10.8], [33.11, -11.61], [33.31, -12.44], [32.99, -12.78], [32.69, -13.71], [33.21, -13.97], [30.18, -14.8], [30.27, -15.51], [29.52, -15.64], [28.95, -16.04], [28.83, -16.39], [28.47, -16.47], [27.6, -17.29], [27.04, -17.94], [26.71, -17.96], [26.38, -17.85], [25.26, -17.74], [25.08, -17.66], [25.08, -17.58], [24.68, -17.35], [24.03, -17.3], [23.22, -17.52], [22.56, -16.9], [21.89, -16.08], [21.93, -12.9], [24.02, -12.91], [23.93, -12.57], [24.08, -12.19], [23.9, -11.72], [24.02, -11.24], [23.91, -10.93], [24.26, -10.95], [24.31, -11.26], [24.78, -11.24], [25.42, -11.33], [25.75, -11.78], [26.55, -11.92], [27.16, -11.61], [27.39, -12.13], [28.16, -12.27], [28.52, -12.7], [28.93, -13.25], [29.7, -13.26], [29.62, -12.18], [29.34, -12.36], [28.64, -11.97], [28.37, -11.79], [28.5, -10.79], [28.67, -9.61], [28.45, -9.16], [28.73, -8.53], [29, -8.41], [30.35, -8.24], [30.74, -8.34]]] } }, { type: "Feature", properties: { iso3: "MWI", имя: "Малави", имя_en: "Malawi", регион: "Eastern Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[32.76, -9.23], [33.74, -9.42], [33.94, -9.69], [34.28, -10.16], [34.56, -11.52], [34.28, -12.28], [34.56, -13.58], [34.91, -13.57], [35.27, -13.89], [35.69, -14.61], [35.77, -15.9], [35.34, -16.11], [35.03, -16.8], [34.38, -16.18], [34.31, -15.48], [34.52, -15.01], [34.46, -14.61], [34.06, -14.36], [33.79, -14.45], [33.21, -13.97], [32.69, -13.71], [32.99, -12.78], [33.31, -12.44], [33.11, -11.61], [33.32, -10.8], [33.49, -10.53], [33.23, -9.68], [32.76, -9.23]]] } }, { type: "Feature", properties: { iso3: "MOZ", имя: "Мозамбик", имя_en: "Mozambique", регион: "Eastern Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[34.56, -11.52], [35.31, -11.44], [36.51, -11.72], [36.78, -11.59], [37.47, -11.57], [37.83, -11.27], [38.43, -11.29], [39.52, -10.9], [40.32, -10.32], [40.32, -10.32], [40.32, -10.32], [40.48, -10.77], [40.44, -11.76], [40.56, -12.64], [40.6, -14.2], [40.78, -14.69], [40.48, -15.41], [40.09, -16.1], [39.45, -16.72], [38.54, -17.1], [37.41, -17.59], [36.28, -18.66], [35.9, -18.84], [35.2, -19.55], [34.79, -19.78], [34.7, -20.5], [35.18, -21.25], [35.37, -21.84], [35.39, -22.14], [35.56, -22.09], [35.53, -23.07], [35.37, -23.54], [35.61, -23.71], [35.46, -24.12], [35.04, -24.48], [34.22, -24.82], [33.01, -25.36], [32.57, -25.73], [32.66, -26.15], [32.92, -26.22], [32.83, -26.74], [32.07, -26.73], [31.99, -26.29], [31.84, -25.84], [31.75, -25.48], [31.93, -24.37], [31.67, -23.66], [31.19, -22.25], [32.24, -21.12], [32.51, -20.4], [32.66, -20.3], [32.77, -19.72], [32.61, -19.42], [32.65, -18.67], [32.85, -17.98], [32.85, -16.71], [32.33, -16.39], [31.85, -16.32], [31.64, -16.07], [31.17, -15.86], [30.34, -15.88], [30.27, -15.51], [30.18, -14.8], [33.21, -13.97], [33.79, -14.45], [34.06, -14.36], [34.46, -14.61], [34.52, -15.01], [34.31, -15.48], [34.38, -16.18], [35.03, -16.8], [35.34, -16.11], [35.77, -15.9], [35.69, -14.61], [35.27, -13.89], [34.91, -13.57], [34.56, -13.58], [34.28, -12.28], [34.56, -11.52]]] } }, { type: "Feature", properties: { iso3: "SWZ", имя: "Эсватини", имя_en: "eSwatini", регион: "Southern Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[32.07, -26.73], [31.87, -27.18], [31.28, -27.29], [30.69, -26.74], [30.68, -26.4], [30.95, -26.02], [31.04, -25.73], [31.33, -25.66], [31.84, -25.84], [31.99, -26.29], [32.07, -26.73]]] } }, { type: "Feature", properties: { iso3: "AGO", имя: "Ангола", имя_en: "Angola", регион: "Middle Africa", континент: "Africa" }, geometry: { type: "MultiPolygon", coordinates: [[[[13, -4.78], [12.63, -4.99], [12.47, -5.25], [12.44, -5.68], [12.18, -5.79], [11.91, -5.04], [12.32, -4.61], [12.62, -4.44], [13, -4.78]]], [[[12.32, -6.1], [12.74, -5.97], [13.02, -5.98], [13.38, -5.86], [16.33, -5.88], [16.57, -6.62], [16.86, -7.22], [17.09, -7.55], [17.47, -8.07], [18.13, -7.99], [18.46, -7.85], [19.02, -7.99], [19.17, -7.74], [19.42, -7.16], [20.04, -7.12], [20.09, -6.94], [20.6, -6.94], [20.51, -7.3], [21.73, -7.29], [21.75, -7.92], [21.95, -8.31], [21.8, -8.91], [21.88, -9.52], [22.21, -9.89], [22.16, -11.08], [22.4, -10.99], [22.84, -11.02], [23.46, -10.87], [23.91, -10.93], [24.02, -11.24], [23.9, -11.72], [24.08, -12.19], [23.93, -12.57], [24.02, -12.91], [21.93, -12.9], [21.89, -16.08], [22.56, -16.9], [23.22, -17.52], [21.38, -17.93], [18.96, -17.79], [18.26, -17.31], [14.21, -17.35], [14.06, -17.42], [13.46, -16.97], [12.81, -16.94], [12.22, -17.11], [11.73, -17.3], [11.64, -16.67], [11.78, -15.79], [12.12, -14.88], [12.18, -14.45], [12.5, -13.55], [12.74, -13.14], [13.31, -12.48], [13.63, -12.04], [13.74, -11.3], [13.69, -10.73], [13.39, -10.37], [13.12, -9.77], [12.88, -9.17], [12.93, -8.96], [13.24, -8.56], [12.93, -7.6], [12.73, -6.93], [12.23, -6.29], [12.32, -6.1]]]] } }, { type: "Feature", properties: { iso3: "BDI", имя: "Бурунди", имя_en: "Burundi", регион: "Eastern Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[30.47, -2.41], [30.53, -2.81], [30.74, -3.03], [30.75, -3.36], [30.51, -3.57], [30.12, -4.09], [29.75, -4.45], [29.34, -4.5], [29.28, -3.29], [29.02, -2.84], [29.63, -2.92], [29.94, -2.35], [30.47, -2.41]]] } }, { type: "Feature", properties: { iso3: "ISR", имя: "Израиль", имя_en: "Israel", регион: "Western Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[35.72, 32.71], [35.55, 32.39], [35.18, 32.53], [34.97, 31.87], [35.23, 31.75], [34.97, 31.62], [34.93, 31.35], [35.4, 31.49], [35.42, 31.1], [34.92, 29.5], [34.82, 29.76], [34.27, 31.22], [34.27, 31.22], [34.27, 31.22], [34.56, 31.55], [34.49, 31.61], [34.75, 32.07], [34.96, 32.83], [35.1, 33.08], [35.13, 33.09], [35.46, 33.09], [35.55, 33.26], [35.82, 33.28], [35.84, 32.87], [35.7, 32.72], [35.72, 32.71]]] } }, { type: "Feature", properties: { iso3: "LBN", имя: "Ливан", имя_en: "Lebanon", регион: "Western Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[35.82, 33.28], [35.55, 33.26], [35.46, 33.09], [35.13, 33.09], [35.48, 33.91], [35.98, 34.61], [36, 34.64], [36.45, 34.59], [36.61, 34.2], [36.07, 33.82], [35.82, 33.28]]] } }, { type: "Feature", properties: { iso3: "MDG", имя: "Мадагаскар", имя_en: "Madagascar", регион: "Eastern Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[49.54, -12.47], [49.81, -12.9], [50.06, -13.56], [50.22, -14.76], [50.48, -15.23], [50.38, -15.71], [50.2, -16], [49.86, -15.41], [49.67, -15.71], [49.86, -16.45], [49.77, -16.88], [49.5, -17.11], [49.44, -17.95], [49.04, -19.12], [48.55, -20.5], [47.93, -22.39], [47.55, -23.78], [47.1, -24.94], [46.28, -25.18], [45.41, -25.6], [44.83, -25.35], [44.04, -24.99], [43.76, -24.46], [43.7, -23.57], [43.35, -22.78], [43.25, -22.06], [43.43, -21.34], [43.89, -21.16], [43.9, -20.83], [44.37, -20.07], [44.46, -19.44], [44.23, -18.96], [44.04, -18.33], [43.96, -17.41], [44.31, -16.85], [44.45, -16.22], [44.94, -16.18], [45.5, -15.97], [45.87, -15.79], [46.31, -15.78], [46.88, -15.21], [47.71, -14.59], [48.01, -14.09], [47.87, -13.66], [48.29, -13.78], [48.85, -13.09], [48.86, -12.49], [49.19, -12.04], [49.54, -12.47]]] } }, { type: "Feature", properties: { iso3: "PSE", имя: "Палестина", имя_en: "Palestine", регион: "Western Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[35.4, 31.49], [34.93, 31.35], [34.97, 31.62], [35.23, 31.75], [34.97, 31.87], [35.18, 32.53], [35.55, 32.39], [35.55, 31.78], [35.4, 31.49]]] } }, { type: "Feature", properties: { iso3: "GMB", имя: "Гамбия", имя_en: "Gambia", регион: "Western Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[-16.71, 13.59], [-15.62, 13.62], [-15.4, 13.86], [-15.08, 13.88], [-14.69, 13.63], [-14.38, 13.63], [-14.05, 13.79], [-13.84, 13.51], [-14.28, 13.28], [-14.71, 13.3], [-15.14, 13.51], [-15.51, 13.28], [-15.69, 13.27], [-15.93, 13.13], [-16.84, 13.15], [-16.71, 13.59]]] } }, { type: "Feature", properties: { iso3: "TUN", имя: "Тунис", имя_en: "Tunisia", регион: "Northern Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[9.48, 30.31], [9.06, 32.1], [8.44, 32.51], [8.43, 32.75], [7.61, 33.34], [7.52, 34.1], [8.14, 34.66], [8.38, 35.48], [8.22, 36.43], [8.42, 36.95], [9.51, 37.35], [10.21, 37.23], [10.18, 36.72], [11.03, 37.09], [11.1, 36.9], [10.6, 36.41], [10.59, 35.95], [10.94, 35.7], [10.81, 34.83], [10.15, 34.33], [10.34, 33.79], [10.86, 33.77], [11.11, 33.29], [11.49, 33.14], [11.43, 32.37], [10.94, 32.08], [10.64, 31.76], [9.95, 31.38], [10.06, 30.96], [9.97, 30.54], [9.48, 30.31]]] } }, { type: "Feature", properties: { iso3: "DZA", имя: "Алжир", имя_en: "Algeria", регион: "Northern Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[-8.68, 27.4], [-8.67, 27.59], [-8.67, 27.66], [-8.67, 28.84], [-7.06, 29.58], [-6.06, 29.73], [-5.24, 30], [-4.86, 30.5], [-3.69, 30.9], [-3.65, 31.64], [-3.07, 31.72], [-2.62, 32.09], [-1.31, 32.26], [-1.12, 32.65], [-1.39, 32.86], [-1.73, 33.92], [-1.79, 34.53], [-2.17, 35.17], [-1.21, 35.71], [-0.13, 35.89], [0.5, 36.3], [1.47, 36.61], [3.16, 36.78], [4.82, 36.87], [5.32, 36.72], [6.26, 37.11], [7.33, 37.12], [7.74, 36.89], [8.42, 36.95], [8.22, 36.43], [8.38, 35.48], [8.14, 34.66], [7.52, 34.1], [7.61, 33.34], [8.43, 32.75], [8.44, 32.51], [9.06, 32.1], [9.48, 30.31], [9.81, 29.42], [9.86, 28.96], [9.68, 28.14], [9.76, 27.69], [9.63, 27.14], [9.72, 26.51], [9.32, 26.09], [9.91, 25.37], [9.95, 24.94], [10.3, 24.38], [10.77, 24.56], [11.56, 24.1], [12, 23.47], [8.57, 21.57], [5.68, 19.6], [4.27, 19.16], [3.16, 19.06], [3.15, 19.69], [2.68, 19.86], [2.06, 20.14], [1.82, 20.61], [-1.55, 22.79], [-4.92, 24.97], [-8.68, 27.4]]] } }, { type: "Feature", properties: { iso3: "JOR", имя: "Иордания", имя_en: "Jordan", регион: "Western Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[35.55, 32.39], [35.72, 32.71], [36.83, 32.31], [38.79, 33.38], [39.2, 32.16], [39, 32.01], [37, 31.51], [38, 30.51], [37.67, 30.34], [37.5, 30], [36.74, 29.87], [36.5, 29.51], [36.07, 29.2], [34.96, 29.36], [34.92, 29.5], [35.42, 31.1], [35.4, 31.49], [35.55, 31.78], [35.55, 32.39]]] } }, { type: "Feature", properties: { iso3: "ARE", имя: "Объединённые Арабские Эмираты", имя_en: "United Arab Emirates", регион: "Western Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[51.58, 24.25], [51.76, 24.29], [51.79, 24.02], [52.58, 24.18], [53.4, 24.15], [54.01, 24.12], [54.69, 24.8], [55.44, 25.44], [56.07, 26.06], [56.26, 25.71], [56.4, 24.92], [55.89, 24.92], [55.8, 24.27], [55.98, 24.13], [55.53, 23.93], [55.53, 23.52], [55.23, 23.11], [55.21, 22.71], [55.01, 22.5], [52, 23], [51.62, 24.01], [51.58, 24.25]]] } }, { type: "Feature", properties: { iso3: "QAT", имя: "Катар", имя_en: "Qatar", регион: "Western Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[50.81, 24.75], [50.74, 25.48], [51.01, 26.01], [51.29, 26.11], [51.59, 25.8], [51.61, 25.22], [51.39, 24.63], [51.11, 24.56], [50.81, 24.75]]] } }, { type: "Feature", properties: { iso3: "KWT", имя: "Кувейт", имя_en: "Kuwait", регион: "Western Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[47.97, 29.98], [48.18, 29.53], [48.09, 29.31], [48.42, 28.55], [47.71, 28.53], [47.46, 29], [46.57, 29.1], [47.3, 30.06], [47.97, 29.98]]] } }, { type: "Feature", properties: { iso3: "IRQ", имя: "Ирак", имя_en: "Iraq", регион: "Western Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[39.2, 32.16], [38.79, 33.38], [41.01, 34.42], [41.38, 35.63], [41.29, 36.36], [41.84, 36.61], [42.35, 37.23], [42.78, 37.39], [43.94, 37.26], [44.29, 37], [44.77, 37.17], [45.42, 35.98], [46.08, 35.68], [46.15, 35.09], [45.65, 34.75], [45.42, 33.97], [46.11, 33.02], [47.33, 32.47], [47.85, 31.71], [47.69, 30.98], [48, 30.99], [48.01, 30.45], [48.57, 29.93], [47.97, 29.98], [47.3, 30.06], [46.57, 29.1], [44.71, 29.18], [41.89, 31.19], [40.4, 31.89], [39.2, 32.16]]] } }, { type: "Feature", properties: { iso3: "OMN", имя: "Оман", имя_en: "Oman", регион: "Western Asia", континент: "Asia" }, geometry: { type: "MultiPolygon", coordinates: [[[[55.21, 22.71], [55.23, 23.11], [55.53, 23.52], [55.53, 23.93], [55.98, 24.13], [55.8, 24.27], [55.89, 24.92], [56.4, 24.92], [56.85, 24.24], [57.4, 23.88], [58.14, 23.75], [58.73, 23.57], [59.18, 22.99], [59.45, 22.66], [59.81, 22.53], [59.81, 22.31], [59.44, 21.71], [59.28, 21.43], [58.86, 21.11], [58.49, 20.43], [58.03, 20.48], [57.83, 20.24], [57.67, 19.74], [57.79, 19.07], [57.69, 18.94], [57.23, 18.95], [56.61, 18.57], [56.51, 18.09], [56.28, 17.88], [55.66, 17.88], [55.27, 17.63], [55.27, 17.23], [54.79, 16.95], [54.24, 17.04], [53.57, 16.71], [53.11, 16.65], [52.78, 17.35], [52, 19], [55, 20], [55.67, 22], [55.21, 22.71]]], [[[56.26, 25.71], [56.07, 26.06], [56.36, 26.4], [56.49, 26.31], [56.39, 25.9], [56.26, 25.71]]]] } }, { type: "Feature", properties: { iso3: "VUT", имя: "Вануату", имя_en: "Vanuatu", регион: "Melanesia", континент: "Oceania" }, geometry: { type: "MultiPolygon", coordinates: [[[[167.22, -15.89], [167.84, -16.47], [167.52, -16.6], [167.18, -16.16], [167.22, -15.89]]], [[[166.79, -15.67], [166.65, -15.39], [166.63, -14.63], [167.11, -14.93], [167.27, -15.74], [167, -15.61], [166.79, -15.67]]]] } }, { type: "Feature", properties: { iso3: "KHM", имя: "Камбоджа", имя_en: "Cambodia", регион: "South-Eastern Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[102.58, 12.19], [102.35, 13.39], [102.99, 14.23], [104.28, 14.42], [105.22, 14.27], [106.04, 13.88], [106.5, 14.57], [107.38, 14.2], [107.61, 13.54], [107.49, 12.34], [105.81, 11.57], [106.25, 10.96], [105.2, 10.89], [104.33, 10.49], [103.5, 10.63], [103.09, 11.15], [102.58, 12.19]]] } }, { type: "Feature", properties: { iso3: "THA", имя: "Таиланд", имя_en: "Thailand", регион: "South-Eastern Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[105.22, 14.27], [104.28, 14.42], [102.99, 14.23], [102.35, 13.39], [102.58, 12.19], [101.69, 12.65], [100.83, 12.63], [100.98, 13.41], [100.1, 13.41], [100.02, 12.31], [99.48, 10.85], [99.15, 9.96], [99.22, 9.24], [99.87, 9.21], [100.28, 8.3], [100.46, 7.43], [101.02, 6.86], [101.62, 6.74], [102.14, 6.22], [101.81, 5.81], [101.15, 5.69], [101.08, 6.2], [100.26, 6.64], [100.09, 6.46], [99.69, 6.85], [99.52, 7.34], [98.99, 7.91], [98.5, 8.38], [98.34, 7.79], [98.15, 8.35], [98.26, 8.97], [98.55, 9.93], [99.04, 10.96], [99.59, 11.89], [99.2, 12.8], [99.21, 13.27], [99.1, 13.83], [98.43, 14.62], [98.19, 15.12], [98.54, 15.31], [98.9, 16.18], [98.49, 16.84], [97.86, 17.57], [97.38, 18.45], [97.8, 18.63], [98.25, 19.71], [98.96, 19.75], [99.54, 20.19], [100.12, 20.42], [100.55, 20.11], [100.61, 19.51], [101.28, 19.46], [101.04, 18.41], [101.06, 17.51], [102.11, 18.11], [102.41, 17.93], [103, 17.96], [103.2, 18.31], [103.96, 18.24], [104.72, 17.43], [104.78, 16.44], [105.59, 15.57], [105.54, 14.72], [105.22, 14.27]]] } }, { type: "Feature", properties: { iso3: "LAO", имя: "Лаос", имя_en: "Laos", регион: "South-Eastern Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[107.38, 14.2], [106.5, 14.57], [106.04, 13.88], [105.22, 14.27], [105.54, 14.72], [105.59, 15.57], [104.78, 16.44], [104.72, 17.43], [103.96, 18.24], [103.2, 18.31], [103, 17.96], [102.41, 17.93], [102.11, 18.11], [101.06, 17.51], [101.04, 18.41], [101.28, 19.46], [100.61, 19.51], [100.55, 20.11], [100.12, 20.42], [100.33, 20.79], [101.18, 21.44], [101.27, 21.2], [101.8, 21.17], [101.65, 22.32], [102.17, 22.46], [102.75, 21.68], [103.2, 20.77], [104.44, 20.76], [104.82, 19.89], [104.18, 19.62], [103.9, 19.27], [105.09, 18.67], [105.93, 17.49], [106.56, 16.6], [107.31, 15.91], [107.56, 15.2], [107.38, 14.2]]] } }, { type: "Feature", properties: { iso3: "MMR", имя: "Мьянма", имя_en: "Myanmar", регион: "South-Eastern Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[100.12, 20.42], [99.54, 20.19], [98.96, 19.75], [98.25, 19.71], [97.8, 18.63], [97.38, 18.45], [97.86, 17.57], [98.49, 16.84], [98.9, 16.18], [98.54, 15.31], [98.19, 15.12], [98.43, 14.62], [99.1, 13.83], [99.21, 13.27], [99.2, 12.8], [99.59, 11.89], [99.04, 10.96], [98.55, 9.93], [98.46, 10.68], [98.76, 11.44], [98.43, 12.03], [98.51, 13.12], [98.1, 13.64], [97.78, 14.84], [97.6, 16.1], [97.16, 16.93], [96.51, 16.43], [95.37, 15.71], [94.81, 15.8], [94.19, 16.04], [94.53, 17.28], [94.32, 18.21], [93.54, 19.37], [93.66, 19.73], [93.08, 19.86], [92.37, 20.67], [92.3, 21.48], [92.65, 21.32], [92.67, 22.04], [93.17, 22.28], [93.06, 22.7], [93.29, 23.04], [93.33, 24.08], [94.11, 23.85], [94.55, 24.68], [94.6, 25.16], [95.16, 26], [95.12, 26.57], [96.42, 27.26], [97.13, 27.08], [97.05, 27.7], [97.4, 27.88], [97.33, 28.26], [97.91, 28.34], [98.25, 27.75], [98.68, 27.51], [98.71, 26.74], [98.67, 25.92], [97.72, 25.08], [97.6, 23.9], [98.66, 24.06], [98.9, 23.14], [99.53, 22.95], [99.24, 22.12], [99.98, 21.74], [100.42, 21.56], [101.15, 21.85], [101.18, 21.44], [100.33, 20.79], [100.12, 20.42]]] } }, { type: "Feature", properties: { iso3: "VNM", имя: "Вьетнам", имя_en: "Vietnam", регион: "South-Eastern Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[104.33, 10.49], [105.2, 10.89], [106.25, 10.96], [105.81, 11.57], [107.49, 12.34], [107.61, 13.54], [107.38, 14.2], [107.56, 15.2], [107.31, 15.91], [106.56, 16.6], [105.93, 17.49], [105.09, 18.67], [103.9, 19.27], [104.18, 19.62], [104.82, 19.89], [104.44, 20.76], [103.2, 20.77], [102.75, 21.68], [102.17, 22.46], [102.71, 22.71], [103.5, 22.7], [104.48, 22.82], [105.33, 23.35], [105.81, 22.98], [106.73, 22.79], [106.57, 22.22], [107.04, 21.81], [108.05, 21.55], [106.72, 20.7], [105.88, 19.75], [105.66, 19.06], [106.43, 18], [107.36, 16.7], [108.27, 16.08], [108.88, 15.28], [109.34, 13.43], [109.2, 11.67], [108.37, 11.01], [107.22, 10.36], [106.41, 9.53], [105.16, 8.6], [104.8, 9.24], [105.08, 9.92], [104.33, 10.49]]] } }, { type: "Feature", properties: { iso3: "PRK", имя: "КНДР", имя_en: "North Korea", регион: "Eastern Asia", континент: "Asia" }, geometry: { type: "MultiPolygon", coordinates: [[[[130.78, 42.22], [130.78, 42.22], [130.78, 42.22], [130.78, 42.22]]], [[[130.64, 42.4], [130.64, 42.4], [130.78, 42.22], [130.4, 42.28], [129.97, 41.94], [129.67, 41.6], [129.71, 40.88], [129.19, 40.66], [129.01, 40.49], [128.63, 40.19], [127.97, 40.03], [127.53, 39.76], [127.5, 39.32], [127.39, 39.21], [127.78, 39.05], [128.35, 38.61], [128.21, 38.37], [127.78, 38.3], [127.07, 38.26], [126.68, 37.8], [126.24, 37.84], [126.17, 37.75], [125.69, 37.94], [125.57, 37.75], [125.28, 37.67], [125.24, 37.86], [124.98, 37.95], [124.71, 38.11], [124.99, 38.55], [125.22, 38.67], [125.13, 38.85], [125.39, 39.39], [125.32, 39.55], [124.74, 39.66], [124.27, 39.93], [125.08, 40.57], [126.18, 41.11], [126.87, 41.82], [127.34, 41.5], [128.21, 41.47], [128.05, 41.99], [129.6, 42.42], [129.99, 42.99], [130.64, 42.4]]]] } }, { type: "Feature", properties: { iso3: "KOR", имя: "Республика Корея", имя_en: "South Korea", регион: "Eastern Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[126.17, 37.75], [126.24, 37.84], [126.68, 37.8], [127.07, 38.26], [127.78, 38.3], [128.21, 38.37], [128.35, 38.61], [129.21, 37.43], [129.46, 36.78], [129.47, 35.63], [129.09, 35.08], [128.19, 34.89], [127.39, 34.48], [126.49, 34.39], [126.37, 34.93], [126.56, 35.68], [126.12, 36.73], [126.86, 36.89], [126.17, 37.75]]] } }, { type: "Feature", properties: { iso3: "MNG", имя: "Монголия", имя_en: "Mongolia", регион: "Eastern Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[87.75, 49.3], [88.81, 49.47], [90.71, 50.33], [92.23, 50.8], [93.1, 50.5], [94.15, 50.48], [94.82, 50.01], [95.81, 49.98], [97.26, 49.73], [98.23, 50.42], [97.83, 51.01], [98.86, 52.05], [99.98, 51.63], [100.89, 51.52], [102.07, 51.26], [102.26, 50.51], [103.68, 50.09], [104.62, 50.28], [105.89, 50.41], [106.89, 50.27], [107.87, 49.79], [108.48, 49.28], [109.4, 49.29], [110.66, 49.13], [111.58, 49.38], [112.9, 49.54], [114.36, 50.25], [114.96, 50.14], [115.49, 49.81], [116.68, 49.89], [116.19, 49.13], [115.49, 48.14], [115.74, 47.73], [116.31, 47.85], [117.3, 47.7], [118.06, 48.07], [118.87, 47.75], [119.77, 47.05], [119.66, 46.69], [118.87, 46.81], [117.42, 46.67], [116.72, 46.39], [115.99, 45.73], [114.46, 45.34], [113.46, 44.81], [112.44, 45.01], [111.87, 45.1], [111.35, 44.46], [111.67, 44.07], [111.83, 43.74], [111.13, 43.41], [110.41, 42.87], [109.24, 42.52], [107.74, 42.48], [106.13, 42.13], [104.96, 41.6], [104.52, 41.91], [103.31, 41.91], [101.83, 42.51], [100.85, 42.66], [99.52, 42.52], [97.45, 42.75], [96.35, 42.73], [95.76, 43.32], [95.31, 44.24], [94.69, 44.35], [93.48, 44.98], [92.13, 45.12], [90.95, 45.29], [90.59, 45.72], [90.97, 46.89], [90.28, 47.69], [88.85, 48.07], [88.01, 48.6], [87.75, 49.3]]] } }, { type: "Feature", properties: { iso3: "IND", имя: "Индия", имя_en: "India", регион: "Southern Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[97.33, 28.26], [97.4, 27.88], [97.05, 27.7], [97.13, 27.08], [96.42, 27.26], [95.12, 26.57], [95.16, 26], [94.6, 25.16], [94.55, 24.68], [94.11, 23.85], [93.33, 24.08], [93.29, 23.04], [93.06, 22.7], [93.17, 22.28], [92.67, 22.04], [92.15, 23.63], [91.87, 23.62], [91.71, 22.99], [91.16, 23.5], [91.47, 24.07], [91.92, 24.13], [92.38, 24.98], [91.8, 25.15], [90.87, 25.13], [89.92, 25.27], [89.83, 25.97], [89.36, 26.01], [88.56, 26.45], [88.21, 25.77], [88.93, 25.24], [88.31, 24.87], [88.08, 24.5], [88.7, 24.23], [88.53, 23.63], [88.88, 22.88], [89.03, 22.06], [88.89, 21.69], [88.21, 21.7], [86.98, 21.5], [87.03, 20.74], [86.5, 20.15], [85.06, 19.48], [83.94, 18.3], [83.19, 17.67], [82.19, 17.02], [82.19, 16.56], [81.69, 16.31], [80.79, 15.95], [80.32, 15.9], [80.03, 15.14], [80.23, 13.84], [80.29, 13.01], [79.86, 12.06], [79.86, 10.36], [79.34, 10.31], [78.89, 9.55], [79.19, 9.22], [78.28, 8.93], [77.94, 8.25], [77.54, 7.97], [76.59, 8.9], [76.13, 10.3], [75.75, 11.31], [75.4, 11.78], [74.86, 12.74], [74.62, 13.99], [74.44, 14.62], [73.53, 15.99], [73.12, 17.93], [72.82, 19.21], [72.82, 20.42], [72.63, 21.36], [71.18, 20.76], [70.47, 20.88], [69.16, 22.09], [69.64, 22.45], [69.35, 22.84], [68.18, 23.69], [68.84, 24.36], [71.04, 24.36], [70.84, 25.22], [70.28, 25.72], [70.17, 26.49], [69.51, 26.94], [70.62, 27.99], [71.78, 27.91], [72.82, 28.96], [73.45, 29.98], [74.42, 30.98], [74.41, 31.69], [75.26, 32.27], [74.45, 32.76], [74.1, 33.44], [73.75, 34.32], [74.24, 34.75], [75.76, 34.5], [76.87, 34.65], [77.84, 35.49], [78.91, 34.32], [78.81, 33.51], [79.21, 32.99], [79.18, 32.48], [78.46, 32.62], [78.74, 31.52], [79.72, 30.88], [81.11, 30.18], [80.48, 29.73], [80.09, 28.79], [81.06, 28.42], [82, 27.93], [83.3, 27.36], [84.68, 27.23], [85.25, 26.73], [86.02, 26.63], [87.23, 26.4], [88.06, 26.41], [88.17, 26.81], [88.04, 27.45], [88.12, 27.88], [88.73, 28.09], [88.81, 27.3], [88.84, 27.1], [89.74, 26.72], [90.37, 26.88], [91.22, 26.81], [92.03, 26.84], [92.1, 27.45], [91.7, 27.77], [92.5, 27.9], [93.41, 28.64], [94.57, 29.28], [95.4, 29.03], [96.12, 29.45], [96.59, 28.83], [96.25, 28.41], [97.33, 28.26]]] } }, { type: "Feature", properties: { iso3: "BGD", имя: "Бангладеш", имя_en: "Bangladesh", регион: "Southern Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[92.67, 22.04], [92.65, 21.32], [92.3, 21.48], [92.37, 20.67], [92.08, 21.19], [92.03, 21.7], [91.83, 22.18], [91.42, 22.77], [90.5, 22.81], [90.59, 22.39], [90.27, 21.84], [89.85, 22.04], [89.7, 21.86], [89.42, 21.97], [89.03, 22.06], [88.88, 22.88], [88.53, 23.63], [88.7, 24.23], [88.08, 24.5], [88.31, 24.87], [88.93, 25.24], [88.21, 25.77], [88.56, 26.45], [89.36, 26.01], [89.83, 25.97], [89.92, 25.27], [90.87, 25.13], [91.8, 25.15], [92.38, 24.98], [91.92, 24.13], [91.47, 24.07], [91.16, 23.5], [91.71, 22.99], [91.87, 23.62], [92.15, 23.63], [92.67, 22.04]]] } }, { type: "Feature", properties: { iso3: "BTN", имя: "Бутан", имя_en: "Bhutan", регион: "Southern Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[91.7, 27.77], [92.1, 27.45], [92.03, 26.84], [91.22, 26.81], [90.37, 26.88], [89.74, 26.72], [88.84, 27.1], [88.81, 27.3], [89.48, 28.04], [90.02, 28.3], [90.73, 28.06], [91.26, 28.04], [91.7, 27.77]]] } }, { type: "Feature", properties: { iso3: "NPL", имя: "Непал", имя_en: "Nepal", регион: "Southern Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[88.12, 27.88], [88.04, 27.45], [88.17, 26.81], [88.06, 26.41], [87.23, 26.4], [86.02, 26.63], [85.25, 26.73], [84.68, 27.23], [83.3, 27.36], [82, 27.93], [81.06, 28.42], [80.09, 28.79], [80.48, 29.73], [81.11, 30.18], [81.53, 30.42], [82.33, 30.12], [83.34, 29.46], [83.9, 29.32], [84.23, 28.84], [85.01, 28.64], [85.82, 28.2], [86.95, 27.97], [88.12, 27.88]]] } }, { type: "Feature", properties: { iso3: "PAK", имя: "Пакистан", имя_en: "Pakistan", регион: "Southern Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[77.84, 35.49], [76.87, 34.65], [75.76, 34.5], [74.24, 34.75], [73.75, 34.32], [74.1, 33.44], [74.45, 32.76], [75.26, 32.27], [74.41, 31.69], [74.42, 30.98], [73.45, 29.98], [72.82, 28.96], [71.78, 27.91], [70.62, 27.99], [69.51, 26.94], [70.17, 26.49], [70.28, 25.72], [70.84, 25.22], [71.04, 24.36], [68.84, 24.36], [68.18, 23.69], [67.44, 23.94], [67.15, 24.66], [66.37, 25.43], [64.53, 25.24], [62.91, 25.22], [61.5, 25.08], [61.87, 26.24], [63.32, 26.76], [63.23, 27.22], [62.76, 27.38], [62.73, 28.26], [61.77, 28.7], [61.37, 29.3], [60.87, 29.83], [62.55, 29.32], [63.55, 29.47], [64.15, 29.34], [64.35, 29.56], [65.05, 29.47], [66.35, 29.89], [66.38, 30.74], [66.94, 31.3], [67.68, 31.3], [67.79, 31.58], [68.56, 31.71], [68.93, 31.62], [69.32, 31.9], [69.26, 32.5], [69.69, 33.11], [70.32, 33.36], [69.93, 34.02], [70.88, 33.99], [71.16, 34.35], [71.12, 34.73], [71.61, 35.15], [71.5, 35.65], [71.26, 36.07], [71.85, 36.51], [72.92, 36.72], [74.07, 36.84], [74.58, 37.02], [75.16, 37.13], [75.9, 36.67], [76.19, 35.9], [77.84, 35.49]]] } }, { type: "Feature", properties: { iso3: "AFG", имя: "Афганистан", имя_en: "Afghanistan", регион: "Southern Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[66.52, 37.36], [67.08, 37.36], [67.83, 37.14], [68.14, 37.02], [68.86, 37.34], [69.2, 37.15], [69.52, 37.61], [70.12, 37.59], [70.27, 37.74], [70.38, 38.14], [70.81, 38.49], [71.35, 38.26], [71.24, 37.95], [71.54, 37.91], [71.45, 37.07], [71.84, 36.74], [72.19, 36.95], [72.64, 37.05], [73.26, 37.5], [73.95, 37.42], [74.98, 37.42], [75.16, 37.13], [74.58, 37.02], [74.07, 36.84], [72.92, 36.72], [71.85, 36.51], [71.26, 36.07], [71.5, 35.65], [71.61, 35.15], [71.12, 34.73], [71.16, 34.35], [70.88, 33.99], [69.93, 34.02], [70.32, 33.36], [69.69, 33.11], [69.26, 32.5], [69.32, 31.9], [68.93, 31.62], [68.56, 31.71], [67.79, 31.58], [67.68, 31.3], [66.94, 31.3], [66.38, 30.74], [66.35, 29.89], [65.05, 29.47], [64.35, 29.56], [64.15, 29.34], [63.55, 29.47], [62.55, 29.32], [60.87, 29.83], [61.78, 30.74], [61.7, 31.38], [60.94, 31.55], [60.86, 32.18], [60.54, 32.98], [60.96, 33.53], [60.53, 33.68], [60.8, 34.4], [61.21, 35.65], [62.23, 35.27], [62.98, 35.4], [63.19, 35.86], [63.98, 36.01], [64.55, 36.31], [64.75, 37.11], [65.59, 37.31], [65.75, 37.66], [66.22, 37.39], [66.52, 37.36]]] } }, { type: "Feature", properties: { iso3: "TJK", имя: "Таджикистан", имя_en: "Tajikistan", регион: "Central Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[67.83, 37.14], [68.39, 38.16], [68.18, 38.9], [67.44, 39.14], [67.7, 39.58], [68.54, 39.53], [69.01, 40.09], [69.33, 40.73], [70.67, 40.96], [70.46, 40.5], [70.6, 40.22], [71.01, 40.24], [70.65, 39.94], [69.56, 40.1], [69.46, 39.53], [70.55, 39.6], [71.78, 39.28], [73.68, 39.43], [73.93, 38.51], [74.26, 38.61], [74.86, 38.38], [74.83, 37.99], [74.98, 37.42], [73.95, 37.42], [73.26, 37.5], [72.64, 37.05], [72.19, 36.95], [71.84, 36.74], [71.45, 37.07], [71.54, 37.91], [71.24, 37.95], [71.35, 38.26], [70.81, 38.49], [70.38, 38.14], [70.27, 37.74], [70.12, 37.59], [69.52, 37.61], [69.2, 37.15], [68.86, 37.34], [68.14, 37.02], [67.83, 37.14]]] } }, { type: "Feature", properties: { iso3: "KGZ", имя: "Киргизия", имя_en: "Kyrgyzstan", регион: "Central Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[70.96, 42.27], [71.19, 42.7], [71.84, 42.85], [73.49, 42.5], [73.65, 43.09], [74.21, 43.3], [75.64, 42.88], [76, 42.99], [77.66, 42.96], [79.14, 42.86], [79.64, 42.5], [80.26, 42.35], [80.12, 42.12], [78.54, 41.58], [78.19, 41.19], [76.9, 41.07], [76.53, 40.43], [75.47, 40.56], [74.78, 40.37], [73.82, 39.89], [73.96, 39.66], [73.68, 39.43], [71.78, 39.28], [70.55, 39.6], [69.46, 39.53], [69.56, 40.1], [70.65, 39.94], [71.01, 40.24], [71.77, 40.15], [73.06, 40.87], [71.87, 41.39], [71.16, 41.14], [70.42, 41.52], [71.26, 42.17], [70.96, 42.27]]] } }, { type: "Feature", properties: { iso3: "TKM", имя: "Туркмения", имя_en: "Turkmenistan", регион: "Central Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[52.5, 41.78], [52.94, 42.12], [54.08, 42.32], [54.76, 42.04], [55.46, 41.26], [55.97, 41.31], [57.1, 41.32], [56.93, 41.83], [57.79, 42.17], [58.63, 42.75], [59.98, 42.22], [60.08, 41.43], [60.47, 41.22], [61.55, 41.27], [61.88, 41.08], [62.37, 40.05], [63.52, 39.36], [64.17, 38.89], [65.22, 38.4], [66.55, 37.97], [66.52, 37.36], [66.22, 37.39], [65.75, 37.66], [65.59, 37.31], [64.75, 37.11], [64.55, 36.31], [63.98, 36.01], [63.19, 35.86], [62.98, 35.4], [62.23, 35.27], [61.21, 35.65], [61.12, 36.49], [60.38, 36.53], [59.23, 37.41], [58.44, 37.52], [57.33, 38.03], [56.62, 38.12], [56.18, 37.94], [55.51, 37.96], [54.8, 37.39], [53.92, 37.2], [53.74, 37.91], [53.88, 38.95], [53.1, 39.29], [53.36, 39.98], [52.69, 40.03], [52.92, 40.88], [53.86, 40.63], [54.74, 40.95], [54.01, 41.55], [53.72, 42.12], [52.92, 41.87], [52.81, 41.14], [52.5, 41.78]]] } }, { type: "Feature", properties: { iso3: "IRN", имя: "Иран", имя_en: "Iran", регион: "Southern Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[48.57, 29.93], [48.01, 30.45], [48, 30.99], [47.69, 30.98], [47.85, 31.71], [47.33, 32.47], [46.11, 33.02], [45.42, 33.97], [45.65, 34.75], [46.15, 35.09], [46.08, 35.68], [45.42, 35.98], [44.77, 37.17], [44.77, 37.17], [44.23, 37.97], [44.42, 38.28], [44.11, 39.43], [44.79, 39.71], [44.95, 39.34], [45.46, 38.87], [46.14, 38.74], [46.51, 38.77], [47.69, 39.51], [48.06, 39.58], [48.36, 39.29], [48.01, 38.79], [48.63, 38.27], [48.88, 38.32], [49.2, 37.58], [50.15, 37.37], [50.84, 36.87], [52.26, 36.7], [53.83, 36.97], [53.92, 37.2], [54.8, 37.39], [55.51, 37.96], [56.18, 37.94], [56.62, 38.12], [57.33, 38.03], [58.44, 37.52], [59.23, 37.41], [60.38, 36.53], [61.12, 36.49], [61.21, 35.65], [60.8, 34.4], [60.53, 33.68], [60.96, 33.53], [60.54, 32.98], [60.86, 32.18], [60.94, 31.55], [61.7, 31.38], [61.78, 30.74], [60.87, 29.83], [61.37, 29.3], [61.77, 28.7], [62.73, 28.26], [62.76, 27.38], [63.23, 27.22], [63.32, 26.76], [61.87, 26.24], [61.5, 25.08], [59.62, 25.38], [58.53, 25.61], [57.4, 25.74], [56.97, 26.97], [56.49, 27.14], [55.72, 26.96], [54.72, 26.48], [53.49, 26.81], [52.48, 27.58], [51.52, 27.87], [50.85, 28.81], [50.12, 30.15], [49.58, 29.99], [48.94, 30.32], [48.57, 29.93]]] } }, { type: "Feature", properties: { iso3: "SYR", имя: "Сирия", имя_en: "Syria", регион: "Western Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[35.72, 32.71], [35.7, 32.72], [35.84, 32.87], [35.82, 33.28], [36.07, 33.82], [36.61, 34.2], [36.45, 34.59], [36, 34.64], [35.91, 35.41], [36.15, 35.82], [36.42, 36.04], [36.69, 36.26], [36.74, 36.82], [37.07, 36.62], [38.17, 36.9], [38.7, 36.71], [39.52, 36.72], [40.67, 37.09], [41.21, 37.07], [42.35, 37.23], [41.84, 36.61], [41.29, 36.36], [41.38, 35.63], [41.01, 34.42], [38.79, 33.38], [36.83, 32.31], [35.72, 32.71]]] } }, { type: "Feature", properties: { iso3: "ARM", имя: "Армения", имя_en: "Armenia", регион: "Western Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[46.51, 38.77], [46.14, 38.74], [45.74, 39.32], [45.74, 39.47], [45.3, 39.47], [45, 39.74], [44.79, 39.71], [44.4, 40.01], [43.66, 40.25], [43.75, 40.74], [43.58, 41.09], [44.97, 41.25], [45.18, 40.99], [45.56, 40.81], [45.36, 40.56], [45.89, 40.22], [45.61, 39.9], [46.03, 39.63], [46.48, 39.46], [46.51, 38.77]]] } }, { type: "Feature", properties: { iso3: "SWE", имя: "Швеция", имя_en: "Sweden", регион: "Northern Europe", континент: "Europe" }, geometry: { type: "Polygon", coordinates: [[[11.03, 58.86], [11.47, 59.43], [12.3, 60.12], [12.63, 61.29], [11.99, 61.8], [11.93, 63.13], [12.58, 64.07], [13.57, 64.05], [13.92, 64.45], [13.56, 64.79], [15.11, 66.19], [16.11, 67.3], [16.77, 68.01], [17.73, 68.01], [17.99, 68.57], [19.88, 68.41], [20.03, 69.07], [20.65, 69.11], [21.98, 68.62], [23.54, 67.94], [23.57, 66.4], [23.9, 66.01], [22.18, 65.72], [21.21, 65.03], [21.37, 64.41], [19.78, 63.61], [17.85, 62.75], [17.12, 61.34], [17.83, 60.64], [18.79, 60.08], [17.87, 58.95], [16.83, 58.72], [16.45, 57.04], [15.88, 56.1], [14.67, 56.2], [14.1, 55.41], [12.94, 55.36], [12.63, 56.31], [11.79, 57.44], [11.03, 58.86]]] } }, { type: "Feature", properties: { iso3: "BLR", имя: "Белоруссия", имя_en: "Belarus", регион: "Eastern Europe", континент: "Europe" }, geometry: { type: "Polygon", coordinates: [[[28.18, 56.17], [29.23, 55.92], [29.37, 55.67], [29.9, 55.79], [30.87, 55.55], [30.97, 55.08], [30.76, 54.81], [31.38, 54.16], [31.79, 53.97], [31.73, 53.79], [32.41, 53.62], [32.69, 53.35], [32.3, 53.13], [31.5, 53.17], [31.31, 53.07], [31.54, 52.74], [31.79, 52.1], [31.79, 52.1], [30.93, 52.04], [30.62, 51.82], [30.56, 51.32], [30.16, 51.42], [29.25, 51.37], [28.99, 51.6], [28.62, 51.43], [28.24, 51.57], [27.45, 51.59], [26.34, 51.83], [25.33, 51.91], [24.55, 51.89], [24.01, 51.62], [23.53, 51.58], [23.51, 52.02], [23.2, 52.49], [23.8, 52.69], [23.8, 53.09], [23.53, 53.47], [23.48, 53.91], [24.45, 53.91], [25.54, 54.28], [25.77, 54.85], [26.59, 55.17], [26.49, 55.62], [27.1, 55.78], [28.18, 56.17]]] } }, { type: "Feature", properties: { iso3: "UKR", имя: "Украина", имя_en: "Ukraine", регион: "Eastern Europe", континент: "Europe" }, geometry: { type: "Polygon", coordinates: [[[31.79, 52.1], [32.16, 52.06], [32.41, 52.29], [32.72, 52.24], [33.75, 52.34], [34.39, 51.77], [34.14, 51.57], [34.22, 51.26], [35.02, 51.21], [35.38, 50.77], [35.36, 50.58], [36.63, 50.23], [37.39, 50.38], [38.01, 49.92], [38.59, 49.93], [40.07, 49.6], [40.08, 49.31], [39.67, 48.78], [39.9, 48.23], [39.74, 47.9], [38.77, 47.83], [38.26, 47.55], [38.22, 47.1], [37.43, 47.02], [36.76, 46.7], [35.82, 46.65], [34.96, 46.27], [35.01, 45.74], [34.86, 45.77], [34.73, 45.97], [34.41, 46.01], [33.7, 46.22], [33.44, 45.97], [33.3, 46.08], [31.74, 46.33], [31.68, 46.71], [30.75, 46.58], [30.38, 46.03], [29.6, 45.29], [29.15, 45.46], [28.68, 45.3], [28.23, 45.49], [28.49, 45.6], [28.66, 45.94], [28.93, 46.26], [28.86, 46.44], [29.07, 46.52], [29.17, 46.38], [29.76, 46.35], [30.02, 46.42], [29.84, 46.53], [29.91, 46.67], [29.56, 46.93], [29.42, 47.35], [29.05, 47.51], [29.12, 47.85], [28.67, 48.12], [28.26, 48.16], [27.52, 48.47], [26.86, 48.37], [26.62, 48.22], [26.2, 48.22], [25.95, 47.99], [25.21, 47.89], [24.87, 47.74], [24.4, 47.98], [23.76, 47.99], [23.14, 48.1], [22.71, 47.88], [22.64, 48.15], [22.09, 48.42], [22.28, 48.83], [22.56, 49.09], [22.78, 49.03], [22.52, 49.48], [23.43, 50.31], [23.92, 50.42], [24.03, 50.71], [23.53, 51.58], [24.01, 51.62], [24.55, 51.89], [25.33, 51.91], [26.34, 51.83], [27.45, 51.59], [28.24, 51.57], [28.62, 51.43], [28.99, 51.6], [29.25, 51.37], [30.16, 51.42], [30.56, 51.32], [30.62, 51.82], [30.93, 52.04], [31.79, 52.1]]] } }, { type: "Feature", properties: { iso3: "POL", имя: "Польша", имя_en: "Poland", регион: "Eastern Europe", континент: "Europe" }, geometry: { type: "Polygon", coordinates: [[[23.48, 53.91], [23.53, 53.47], [23.8, 53.09], [23.8, 52.69], [23.2, 52.49], [23.51, 52.02], [23.53, 51.58], [24.03, 50.71], [23.92, 50.42], [23.43, 50.31], [22.52, 49.48], [22.78, 49.03], [22.56, 49.09], [21.61, 49.47], [20.89, 49.33], [20.42, 49.43], [19.83, 49.22], [19.32, 49.57], [18.91, 49.44], [18.85, 49.5], [18.39, 49.99], [17.65, 50.05], [17.55, 50.36], [16.87, 50.47], [16.72, 50.22], [16.18, 50.42], [16.24, 50.7], [15.49, 50.78], [15.02, 51.11], [14.61, 51.75], [14.69, 52.09], [14.44, 52.62], [14.07, 52.98], [14.35, 53.25], [14.12, 53.76], [14.8, 54.05], [16.36, 54.51], [17.62, 54.85], [18.62, 54.68], [18.7, 54.44], [19.66, 54.43], [20.89, 54.31], [22.73, 54.33], [23.24, 54.22], [23.48, 53.91]]] } }, { type: "Feature", properties: { iso3: "AUT", имя: "Австрия", имя_en: "Austria", регион: "Western Europe", континент: "Europe" }, geometry: { type: "Polygon", coordinates: [[[16.98, 48.12], [16.9, 47.71], [16.34, 47.71], [16.53, 47.5], [16.2, 46.85], [16.01, 46.68], [15.14, 46.66], [14.63, 46.43], [13.81, 46.51], [12.38, 46.77], [12.15, 47.12], [11.16, 46.94], [11.05, 46.75], [10.44, 46.89], [9.93, 46.92], [9.48, 47.1], [9.63, 47.35], [9.59, 47.53], [9.9, 47.58], [10.4, 47.3], [10.54, 47.57], [11.43, 47.52], [12.14, 47.7], [12.62, 47.67], [12.93, 47.47], [13.03, 47.64], [12.88, 48.29], [13.24, 48.42], [13.6, 48.88], [14.34, 48.56], [14.9, 48.96], [15.25, 49.04], [16.03, 48.73], [16.5, 48.79], [16.96, 48.6], [16.88, 48.47], [16.98, 48.12]]] } }, { type: "Feature", properties: { iso3: "HUN", имя: "Венгрия", имя_en: "Hungary", регион: "Eastern Europe", континент: "Europe" }, geometry: { type: "Polygon", coordinates: [[[22.09, 48.42], [22.64, 48.15], [22.71, 47.88], [22.1, 47.67], [21.63, 46.99], [21.02, 46.32], [20.22, 46.13], [19.6, 46.17], [18.83, 45.91], [18.83, 45.91], [18.46, 45.76], [17.63, 45.95], [16.88, 46.38], [16.56, 46.5], [16.37, 46.84], [16.2, 46.85], [16.53, 47.5], [16.34, 47.71], [16.9, 47.71], [16.98, 48.12], [17.49, 47.87], [17.86, 47.76], [18.7, 47.88], [18.78, 48.08], [19.17, 48.11], [19.66, 48.27], [19.77, 48.2], [20.24, 48.33], [20.47, 48.56], [20.8, 48.62], [21.87, 48.32], [22.09, 48.42]]] } }, { type: "Feature", properties: { iso3: "MDA", имя: "Молдавия", имя_en: "Moldova", регион: "Eastern Europe", континент: "Europe" }, geometry: { type: "Polygon", coordinates: [[[26.62, 48.22], [26.86, 48.37], [27.52, 48.47], [28.26, 48.16], [28.67, 48.12], [29.12, 47.85], [29.05, 47.51], [29.42, 47.35], [29.56, 46.93], [29.91, 46.67], [29.84, 46.53], [30.02, 46.42], [29.76, 46.35], [29.17, 46.38], [29.07, 46.52], [28.86, 46.44], [28.93, 46.26], [28.66, 45.94], [28.49, 45.6], [28.23, 45.49], [28.05, 45.94], [28.16, 46.37], [28.13, 46.81], [27.55, 47.41], [27.23, 47.83], [26.92, 48.12], [26.62, 48.22]]] } }, { type: "Feature", properties: { iso3: "ROU", имя: "Румыния", имя_en: "Romania", регион: "Eastern Europe", континент: "Europe" }, geometry: { type: "Polygon", coordinates: [[[28.23, 45.49], [28.68, 45.3], [29.15, 45.46], [29.6, 45.29], [29.63, 45.04], [29.14, 44.82], [28.84, 44.91], [28.56, 43.71], [27.97, 43.81], [27.24, 44.18], [26.07, 43.94], [25.57, 43.69], [24.1, 43.74], [23.33, 43.9], [22.94, 43.82], [22.66, 44.23], [22.47, 44.41], [22.71, 44.58], [22.46, 44.7], [22.15, 44.48], [21.56, 44.77], [21.48, 45.18], [20.87, 45.42], [20.76, 45.73], [20.22, 46.13], [21.02, 46.32], [21.63, 46.99], [22.1, 47.67], [22.71, 47.88], [23.14, 48.1], [23.76, 47.99], [24.4, 47.98], [24.87, 47.74], [25.21, 47.89], [25.95, 47.99], [26.2, 48.22], [26.62, 48.22], [26.92, 48.12], [27.23, 47.83], [27.55, 47.41], [28.13, 46.81], [28.16, 46.37], [28.05, 45.94], [28.23, 45.49]]] } }, { type: "Feature", properties: { iso3: "LTU", имя: "Литва", имя_en: "Lithuania", регион: "Northern Europe", континент: "Europe" }, geometry: { type: "Polygon", coordinates: [[[26.49, 55.62], [26.59, 55.17], [25.77, 54.85], [25.54, 54.28], [24.45, 53.91], [23.48, 53.91], [23.24, 54.22], [22.73, 54.33], [22.65, 54.58], [22.76, 54.86], [22.32, 55.02], [21.27, 55.19], [21.06, 56.03], [22.2, 56.34], [23.88, 56.27], [24.86, 56.37], [25, 56.16], [25.53, 56.1], [26.49, 55.62]]] } }, { type: "Feature", properties: { iso3: "LVA", имя: "Латвия", имя_en: "Latvia", регион: "Northern Europe", континент: "Europe" }, geometry: { type: "Polygon", coordinates: [[[27.29, 57.47], [27.77, 57.24], [27.86, 56.76], [28.18, 56.17], [27.1, 55.78], [26.49, 55.62], [25.53, 56.1], [25, 56.16], [24.86, 56.37], [23.88, 56.27], [22.2, 56.34], [21.06, 56.03], [21.09, 56.78], [21.58, 57.41], [22.52, 57.75], [23.32, 57.01], [24.12, 57.03], [24.31, 57.79], [25.16, 57.97], [25.6, 57.85], [26.46, 57.48], [27.29, 57.47]]] } }, { type: "Feature", properties: { iso3: "EST", имя: "Эстония", имя_en: "Estonia", регион: "Northern Europe", континент: "Europe" }, geometry: { type: "Polygon", coordinates: [[[27.98, 59.48], [27.98, 59.48], [28.13, 59.3], [27.42, 58.72], [27.72, 57.79], [27.29, 57.47], [26.46, 57.48], [25.6, 57.85], [25.16, 57.97], [24.31, 57.79], [24.43, 58.38], [24.06, 58.26], [23.43, 58.61], [23.34, 59.19], [24.6, 59.47], [25.86, 59.61], [26.95, 59.45], [27.98, 59.48], [27.98, 59.48]]] } }, { type: "Feature", properties: { iso3: "DEU", имя: "Германия", имя_en: "Germany", регион: "Western Europe", континент: "Europe" }, geometry: { type: "Polygon", coordinates: [[[14.12, 53.76], [14.35, 53.25], [14.07, 52.98], [14.44, 52.62], [14.69, 52.09], [14.61, 51.75], [15.02, 51.11], [14.57, 51], [14.31, 51.12], [14.06, 50.93], [13.34, 50.73], [12.97, 50.48], [12.24, 50.27], [12.42, 49.97], [12.52, 49.55], [13.03, 49.31], [13.6, 48.88], [13.24, 48.42], [12.88, 48.29], [13.03, 47.64], [12.93, 47.47], [12.62, 47.67], [12.14, 47.7], [11.43, 47.52], [10.54, 47.57], [10.4, 47.3], [9.9, 47.58], [9.59, 47.53], [8.52, 47.83], [8.32, 47.61], [7.47, 47.62], [7.59, 48.33], [8.1, 49.02], [6.66, 49.2], [6.19, 49.46], [6.24, 49.9], [6.04, 50.13], [6.16, 50.8], [5.99, 51.85], [6.59, 51.85], [6.84, 52.23], [7.09, 53.14], [6.91, 53.48], [7.1, 53.69], [7.94, 53.75], [8.12, 53.53], [8.8, 54.02], [8.57, 54.4], [8.53, 54.96], [9.28, 54.83], [9.92, 54.98], [9.94, 54.6], [10.95, 54.36], [10.94, 54.01], [11.96, 54.2], [12.52, 54.47], [13.65, 54.08], [14.12, 53.76]]] } }, { type: "Feature", properties: { iso3: "BGR", имя: "Болгария", имя_en: "Bulgaria", регион: "Eastern Europe", континент: "Europe" }, geometry: { type: "Polygon", coordinates: [[[22.66, 44.23], [22.94, 43.82], [23.33, 43.9], [24.1, 43.74], [25.57, 43.69], [26.07, 43.94], [27.24, 44.18], [27.97, 43.81], [28.56, 43.71], [28.04, 43.29], [27.67, 42.58], [28, 42.01], [27.14, 42.14], [26.12, 41.83], [26.11, 41.33], [25.2, 41.23], [24.49, 41.58], [23.69, 41.31], [22.95, 41.34], [22.88, 42], [22.38, 42.32], [22.55, 42.46], [22.44, 42.58], [22.6, 42.9], [22.99, 43.21], [22.5, 43.64], [22.41, 44.01], [22.66, 44.23]]] } }, { type: "Feature", properties: { iso3: "GRC", имя: "Греция", имя_en: "Greece", регион: "Southern Europe", континент: "Europe" }, geometry: { type: "MultiPolygon", coordinates: [[[[26.29, 35.3], [26.16, 35], [24.72, 34.92], [24.74, 35.08], [23.51, 35.28], [23.7, 35.71], [24.25, 35.37], [25.03, 35.42], [25.77, 35.35], [25.75, 35.18], [26.29, 35.3]]], [[[22.95, 41.34], [23.69, 41.31], [24.49, 41.58], [25.2, 41.23], [26.11, 41.33], [26.12, 41.83], [26.6, 41.56], [26.29, 40.94], [26.06, 40.82], [25.45, 40.85], [24.93, 40.95], [23.71, 40.69], [24.41, 40.12], [23.9, 39.96], [23.34, 39.96], [22.81, 40.48], [22.63, 40.26], [22.85, 39.66], [23.35, 39.19], [22.97, 38.97], [23.53, 38.51], [24.03, 38.22], [24.04, 37.66], [23.12, 37.92], [23.41, 37.41], [22.77, 37.31], [23.15, 36.42], [22.49, 36.41], [21.67, 36.84], [21.3, 37.64], [21.12, 38.31], [20.73, 38.77], [20.22, 39.34], [20.15, 39.62], [20.61, 40.11], [20.67, 40.44], [21, 40.58], [21.02, 40.84], [21.67, 40.93], [22.06, 41.15], [22.6, 41.13], [22.76, 41.3], [22.95, 41.34]]]] } }, { type: "Feature", properties: { iso3: "TUR", имя: "Турция", имя_en: "Turkey", регион: "Western Asia", континент: "Asia" }, geometry: { type: "MultiPolygon", coordinates: [[[[44.77, 37.17], [44.29, 37], [43.94, 37.26], [42.78, 37.39], [42.35, 37.23], [41.21, 37.07], [40.67, 37.09], [39.52, 36.72], [38.7, 36.71], [38.17, 36.9], [37.07, 36.62], [36.74, 36.82], [36.69, 36.26], [36.42, 36.04], [36.15, 35.82], [35.78, 36.27], [36.16, 36.65], [35.55, 36.57], [34.71, 36.8], [34.03, 36.22], [32.51, 36.11], [31.7, 36.64], [30.62, 36.68], [30.39, 36.26], [29.7, 36.14], [28.73, 36.68], [27.64, 36.66], [27.05, 37.65], [26.32, 38.21], [26.8, 38.99], [26.17, 39.46], [27.28, 40.42], [28.82, 40.46], [29.24, 41.22], [31.15, 41.09], [32.35, 41.74], [33.51, 42.02], [35.17, 42.04], [36.91, 41.34], [38.35, 40.95], [39.51, 41.1], [40.37, 41.01], [41.55, 41.54], [42.62, 41.58], [43.58, 41.09], [43.75, 40.74], [43.66, 40.25], [44.4, 40.01], [44.79, 39.71], [44.11, 39.43], [44.42, 38.28], [44.23, 37.97], [44.77, 37.17], [44.77, 37.17]]], [[[26.12, 41.83], [27.14, 42.14], [28, 42.01], [28.12, 41.62], [28.99, 41.3], [28.81, 41.05], [27.62, 41], [27.19, 40.69], [26.36, 40.15], [26.04, 40.62], [26.06, 40.82], [26.29, 40.94], [26.6, 41.56], [26.12, 41.83]]]] } }, { type: "Feature", properties: { iso3: "ALB", имя: "Албания", имя_en: "Albania", регион: "Southern Europe", континент: "Europe" }, geometry: { type: "Polygon", coordinates: [[[21.02, 40.84], [21, 40.58], [20.67, 40.44], [20.61, 40.11], [20.15, 39.62], [19.98, 39.69], [19.96, 39.92], [19.41, 40.25], [19.32, 40.73], [19.4, 41.41], [19.54, 41.72], [19.37, 41.88], [19.37, 41.88], [19.3, 42.2], [19.74, 42.69], [19.8, 42.5], [20.07, 42.59], [20.28, 42.32], [20.52, 42.22], [20.59, 41.86], [20.59, 41.86], [20.46, 41.52], [20.61, 41.09], [21.02, 40.84]]] } }, { type: "Feature", properties: { iso3: "HRV", имя: "Хорватия", имя_en: "Croatia", регион: "Southern Europe", континент: "Europe" }, geometry: { type: "Polygon", coordinates: [[[16.56, 46.5], [16.88, 46.38], [17.63, 45.95], [18.46, 45.76], [18.83, 45.91], [19.07, 45.52], [19.39, 45.24], [19.01, 44.86], [18.55, 45.08], [17.86, 45.07], [17, 45.23], [16.53, 45.21], [16.32, 45], [15.96, 45.23], [15.75, 44.82], [16.24, 44.35], [16.46, 44.04], [16.92, 43.67], [17.3, 43.45], [17.67, 43.03], [18.56, 42.65], [18.45, 42.48], [18.45, 42.48], [17.51, 42.85], [16.93, 43.21], [16.02, 43.51], [15.17, 44.24], [15.38, 44.32], [14.92, 44.74], [14.9, 45.08], [14.26, 45.23], [13.95, 44.8], [13.66, 45.14], [13.68, 45.48], [13.72, 45.5], [14.41, 45.47], [14.6, 45.63], [14.94, 45.47], [15.33, 45.45], [15.32, 45.73], [15.67, 45.83], [15.77, 46.24], [16.56, 46.5]]] } }, { type: "Feature", properties: { iso3: "CHE", имя: "Швейцария", имя_en: "Switzerland", регион: "Western Europe", континент: "Europe" }, geometry: { type: "Polygon", coordinates: [[[9.59, 47.53], [9.63, 47.35], [9.48, 47.1], [9.93, 46.92], [10.44, 46.89], [10.36, 46.48], [9.92, 46.31], [9.18, 46.44], [8.97, 46.04], [8.49, 46.01], [8.32, 46.16], [7.76, 45.82], [7.27, 45.78], [6.84, 45.99], [6.5, 46.43], [6.02, 46.27], [6.04, 46.73], [6.77, 47.29], [6.74, 47.54], [7.19, 47.45], [7.47, 47.62], [8.32, 47.61], [8.52, 47.83], [9.59, 47.53]]] } }, { type: "Feature", properties: { iso3: "LUX", имя: "Люксембург", имя_en: "Luxembourg", регион: "Western Europe", континент: "Europe" }, geometry: { type: "Polygon", coordinates: [[[6.04, 50.13], [6.24, 49.9], [6.19, 49.46], [5.9, 49.44], [5.67, 49.53], [5.78, 50.09], [6.04, 50.13]]] } }, { type: "Feature", properties: { iso3: "BEL", имя: "Бельгия", имя_en: "Belgium", регион: "Western Europe", континент: "Europe" }, geometry: { type: "Polygon", coordinates: [[[6.16, 50.8], [6.04, 50.13], [5.78, 50.09], [5.67, 49.53], [4.8, 49.99], [4.29, 49.91], [3.59, 50.38], [3.12, 50.78], [2.66, 50.8], [2.51, 51.15], [3.31, 51.35], [3.32, 51.35], [3.31, 51.35], [4.05, 51.27], [4.97, 51.48], [5.61, 51.04], [6.16, 50.8]]] } }, { type: "Feature", properties: { iso3: "NLD", имя: "Нидерланды", имя_en: "Netherlands", регион: "Western Europe", континент: "Europe" }, geometry: { type: "Polygon", coordinates: [[[6.91, 53.48], [7.09, 53.14], [6.84, 52.23], [6.59, 51.85], [5.99, 51.85], [6.16, 50.8], [5.61, 51.04], [4.97, 51.48], [4.05, 51.27], [3.31, 51.35], [3.32, 51.35], [3.83, 51.62], [4.71, 53.09], [6.07, 53.51], [6.91, 53.48]]] } }, { type: "Feature", properties: { iso3: "PRT", имя: "Португалия", имя_en: "Portugal", регион: "Southern Europe", континент: "Europe" }, geometry: { type: "Polygon", coordinates: [[[-9.03, 41.88], [-8.67, 42.13], [-8.26, 42.28], [-8.01, 41.79], [-7.42, 41.79], [-7.25, 41.92], [-6.67, 41.88], [-6.39, 41.38], [-6.85, 41.11], [-6.86, 40.33], [-7.03, 40.18], [-7.07, 39.71], [-7.5, 39.63], [-7.1, 39.03], [-7.37, 38.37], [-7.03, 38.08], [-7.17, 37.8], [-7.54, 37.43], [-7.45, 37.1], [-7.86, 36.84], [-8.38, 36.98], [-8.9, 36.87], [-8.75, 37.65], [-8.84, 38.27], [-9.29, 38.36], [-9.53, 38.74], [-9.45, 39.39], [-9.05, 39.76], [-8.98, 40.16], [-8.77, 40.76], [-8.79, 41.18], [-8.99, 41.54], [-9.03, 41.88]]] } }, { type: "Feature", properties: { iso3: "ESP", имя: "Испания", имя_en: "Spain", регион: "Southern Europe", континент: "Europe" }, geometry: { type: "Polygon", coordinates: [[[-7.45, 37.1], [-7.54, 37.43], [-7.17, 37.8], [-7.03, 38.08], [-7.37, 38.37], [-7.1, 39.03], [-7.5, 39.63], [-7.07, 39.71], [-7.03, 40.18], [-6.86, 40.33], [-6.85, 41.11], [-6.39, 41.38], [-6.67, 41.88], [-7.25, 41.92], [-7.42, 41.79], [-8.01, 41.79], [-8.26, 42.28], [-8.67, 42.13], [-9.03, 41.88], [-8.98, 42.59], [-9.39, 43.03], [-7.98, 43.75], [-6.75, 43.57], [-5.41, 43.57], [-4.35, 43.4], [-3.52, 43.46], [-1.9, 43.42], [-1.5, 43.03], [0.34, 42.58], [0.7, 42.8], [1.83, 42.34], [2.99, 42.47], [3.04, 41.89], [2.09, 41.23], [0.81, 41.01], [0.72, 40.68], [0.11, 40.12], [-0.28, 39.31], [0.11, 38.74], [-0.47, 38.29], [-0.68, 37.64], [-1.44, 37.44], [-2.15, 36.67], [-3.42, 36.66], [-4.37, 36.68], [-5, 36.32], [-5.38, 35.95], [-5.87, 36.03], [-6.24, 36.37], [-6.52, 36.94], [-7.45, 37.1]]] } }, { type: "Feature", properties: { iso3: "IRL", имя: "Ирландия", имя_en: "Ireland", регион: "Northern Europe", континент: "Europe" }, geometry: { type: "Polygon", coordinates: [[[-6.2, 53.87], [-6.03, 53.15], [-6.79, 52.26], [-8.56, 51.67], [-9.98, 51.82], [-9.17, 52.86], [-9.69, 53.88], [-8.33, 54.66], [-7.57, 55.13], [-7.37, 54.6], [-7.57, 54.06], [-6.95, 54.07], [-6.2, 53.87]]] } }, { type: "Feature", properties: { iso3: "NCL", имя: "Новая Каледония", имя_en: "New Caledonia", регион: "Melanesia", континент: "Oceania" }, geometry: { type: "Polygon", coordinates: [[[165.78, -21.08], [166.6, -21.7], [167.12, -22.16], [166.74, -22.4], [166.19, -22.13], [165.47, -21.68], [164.83, -21.15], [164.17, -20.44], [164.03, -20.11], [164.46, -20.12], [165.02, -20.46], [165.46, -20.8], [165.78, -21.08]]] } }, { type: "Feature", properties: { iso3: "SLB", имя: "Соломоновы Острова", имя_en: "Solomon Is.", регион: "Melanesia", континент: "Oceania" }, geometry: { type: "MultiPolygon", coordinates: [[[[162.12, -10.48], [162.4, -10.83], [161.7, -10.82], [161.32, -10.2], [161.92, -10.45], [162.12, -10.48]]], [[[161.68, -9.6], [161.53, -9.78], [160.79, -8.92], [160.58, -8.32], [160.92, -8.32], [161.28, -9.12], [161.68, -9.6]]], [[[160.85, -9.87], [160.46, -9.9], [159.85, -9.79], [159.64, -9.64], [159.7, -9.24], [160.36, -9.4], [160.69, -9.61], [160.85, -9.87]]], [[[159.64, -8.02], [159.88, -8.34], [159.92, -8.54], [159.13, -8.11], [158.59, -7.75], [158.21, -7.42], [158.36, -7.32], [158.82, -7.56], [159.64, -8.02]]], [[[157.14, -7.02], [157.54, -7.35], [157.34, -7.4], [156.9, -7.18], [156.49, -6.77], [156.54, -6.6], [157.14, -7.02]]]] } }, { type: "Feature", properties: { iso3: "NZL", имя: "Новая Зеландия", имя_en: "New Zealand", регион: "Australia and New Zealand", континент: "Oceania" }, geometry: { type: "MultiPolygon", coordinates: [[[[176.89, -40.07], [176.51, -40.6], [176.01, -41.29], [175.24, -41.69], [175.07, -41.43], [174.65, -41.28], [175.23, -40.46], [174.9, -39.91], [173.82, -39.51], [173.85, -39.15], [174.57, -38.8], [174.74, -38.03], [174.7, -37.38], [174.29, -36.71], [174.32, -36.53], [173.84, -36.12], [173.05, -35.24], [172.64, -34.53], [173.01, -34.45], [173.55, -35.01], [174.33, -35.27], [174.61, -36.16], [175.34, -37.21], [175.36, -36.53], [175.81, -36.8], [175.96, -37.56], [176.76, -37.88], [177.44, -37.96], [178.01, -37.58], [178.52, -37.7], [178.27, -38.58], [177.97, -39.17], [177.21, -39.15], [176.94, -39.45], [177.03, -39.88], [176.89, -40.07]]], [[[169.67, -43.56], [170.52, -43.03], [171.13, -42.51], [171.57, -41.77], [171.95, -41.51], [172.1, -40.96], [172.8, -40.49], [173.02, -40.92], [173.25, -41.33], [173.96, -40.93], [174.25, -41.35], [174.25, -41.77], [173.88, -42.23], [173.22, -42.97], [172.71, -43.37], [173.08, -43.85], [172.31, -43.87], [171.45, -44.24], [171.19, -44.9], [170.62, -45.91], [169.83, -46.36], [169.33, -46.64], [168.41, -46.62], [167.76, -46.29], [166.68, -46.22], [166.51, -45.85], [167.05, -45.11], [168.3, -44.12], [168.95, -43.94], [169.67, -43.56]]]] } }, { type: "Feature", properties: { iso3: "AUS", имя: "Австралия", имя_en: "Australia", регион: "Australia and New Zealand", континент: "Oceania" }, geometry: { type: "MultiPolygon", coordinates: [[[[147.69, -40.81], [148.29, -40.88], [148.36, -42.06], [148.02, -42.41], [147.91, -43.21], [147.56, -42.94], [146.87, -43.63], [146.66, -43.58], [146.05, -43.55], [145.43, -42.69], [145.3, -42.03], [144.72, -41.16], [144.74, -40.7], [145.4, -40.79], [146.36, -41.14], [146.91, -41], [147.69, -40.81]]], [[[126.15, -32.22], [125.09, -32.73], [124.22, -32.96], [124.03, -33.48], [123.66, -33.89], [122.81, -33.91], [122.18, -34], [121.3, -33.82], [120.58, -33.93], [119.89, -33.98], [119.3, -34.51], [119.01, -34.46], [118.51, -34.75], [118.02, -35.06], [117.3, -35.03], [116.63, -35.03], [115.56, -34.39], [115.03, -34.2], [115.05, -33.62], [115.55, -33.49], [115.71, -33.26], [115.68, -32.9], [115.8, -32.21], [115.69, -31.61], [115.16, -30.6], [115, -30.03], [115.04, -29.46], [114.64, -28.81], [114.62, -28.52], [114.17, -28.12], [114.05, -27.33], [113.48, -26.54], [113.34, -26.12], [113.78, -26.55], [113.44, -25.62], [113.94, -25.91], [114.23, -26.3], [114.22, -25.79], [113.72, -25], [113.63, -24.68], [113.39, -24.38], [113.5, -23.81], [113.71, -23.56], [113.84, -23.06], [113.74, -22.48], [114.15, -21.76], [114.23, -22.52], [114.65, -21.83], [115.46, -21.5], [115.95, -21.07], [116.71, -20.7], [117.17, -20.62], [117.44, -20.75], [118.23, -20.37], [118.84, -20.26], [118.99, -20.04], [119.25, -19.95], [119.81, -19.98], [120.86, -19.68], [121.4, -19.24], [121.66, -18.71], [122.24, -18.2], [122.29, -17.8], [122.31, -17.25], [123.01, -16.41], [123.43, -17.27], [123.86, -17.07], [123.5, -16.6], [123.82, -16.11], [124.26, -16.33], [124.38, -15.57], [124.93, -15.08], [125.17, -14.68], [125.67, -14.51], [125.69, -14.23], [126.13, -14.35], [126.14, -14.1], [126.58, -13.95], [127.07, -13.82], [127.8, -14.28], [128.36, -14.87], [128.99, -14.88], [129.62, -14.97], [129.41, -14.42], [129.89, -13.62], [130.34, -13.36], [130.18, -13.11], [130.62, -12.54], [131.22, -12.18], [131.74, -12.3], [132.58, -12.11], [132.56, -11.6], [131.82, -11.27], [132.36, -11.13], [133.02, -11.38], [133.55, -11.79], [134.39, -12.04], [134.68, -11.94], [135.3, -12.25], [135.88, -11.96], [136.26, -12.05], [136.49, -11.86], [136.95, -12.35], [136.69, -12.89], [136.31, -13.29], [135.96, -13.32], [136.08, -13.72], [135.78, -14.22], [135.43, -14.72], [135.5, -15], [136.3, -15.55], [137.07, -15.87], [137.58, -16.22], [138.3, -16.81], [138.59, -16.81], [139.11, -17.06], [139.26, -17.37], [140.22, -17.71], [140.88, -17.37], [141.07, -16.83], [141.27, -16.39], [141.4, -15.84], [141.7, -15.04], [141.56, -14.56], [141.64, -14.27], [141.52, -13.7], [141.65, -12.94], [141.84, -12.74], [141.69, -12.41], [141.93, -11.88], [142.12, -11.33], [142.14, -11.04], [142.52, -10.67], [142.8, -11.16], [142.87, -11.78], [143.12, -11.91], [143.16, -12.33], [143.52, -12.83], [143.6, -13.4], [143.56, -13.76], [143.92, -14.55], [144.56, -14.17], [144.89, -14.59], [145.37, -14.98], [145.27, -15.43], [145.49, -16.29], [145.64, -16.78], [145.89, -16.91], [146.16, -17.76], [146.06, -18.28], [146.39, -18.96], [147.47, -19.48], [148.18, -19.96], [148.85, -20.39], [148.72, -20.63], [149.29, -21.26], [149.68, -22.34], [150.08, -22.12], [150.48, -22.56], [150.73, -22.4], [150.9, -23.46], [151.61, -24.08], [152.07, -24.46], [152.86, -25.27], [153.14, -26.07], [153.16, -26.64], [153.09, -27.26], [153.57, -28.11], [153.51, -29], [153.34, -29.46], [153.07, -30.35], [153.09, -30.92], [152.89, -31.64], [152.45, -32.55], [151.71, -33.04], [151.34, -33.82], [151.01, -34.31], [150.71, -35.17], [150.33, -35.67], [150.08, -36.42], [149.95, -37.11], [150, -37.43], [149.42, -37.77], [148.3, -37.81], [147.38, -38.22], [146.92, -38.61], [146.32, -39.04], [145.49, -38.59], [144.88, -38.42], [145.03, -37.9], [144.49, -38.09], [143.61, -38.81], [142.75, -38.54], [142.18, -38.38], [141.61, -38.31], [140.64, -38.02], [139.99, -37.4], [139.81, -36.64], [139.57, -36.14], [139.08, -35.73], [138.12, -35.61], [138.45, -35.13], [138.21, -34.38], [137.72, -35.08], [136.83, -35.26], [137.35, -34.71], [137.5, -34.13], [137.89, -33.64], [137.81, -32.9], [137, -33.75], [136.37, -34.09], [135.99, -34.89], [135.21, -34.48], [135.24, -33.95], [134.61, -33.22], [134.09, -32.85], [134.27, -32.62], [132.99, -32.01], [132.29, -31.98], [131.33, -31.5], [129.54, -31.59], [128.24, -31.95], [127.1, -32.28], [126.15, -32.22]]]] } }, { type: "Feature", properties: { iso3: "LKA", имя: "Шри-Ланка", имя_en: "Sri Lanka", регион: "Southern Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[81.79, 7.52], [81.64, 6.48], [81.22, 6.2], [80.35, 5.97], [79.87, 6.76], [79.7, 8.2], [80.15, 9.82], [80.84, 9.27], [81.3, 8.56], [81.79, 7.52]]] } }, { type: "Feature", properties: { iso3: "CHN", имя: "Китайская Народная Республика", имя_en: "China", регион: "Eastern Asia", континент: "Asia" }, geometry: { type: "MultiPolygon", coordinates: [[[[109.48, 18.2], [108.66, 18.51], [108.63, 19.37], [109.12, 19.82], [110.21, 20.1], [110.79, 20.08], [111.01, 19.7], [110.57, 19.26], [110.34, 18.68], [109.48, 18.2]]], [[[80.26, 42.35], [80.18, 42.92], [80.87, 43.18], [79.97, 44.92], [81.95, 45.32], [82.46, 45.54], [83.18, 47.33], [85.16, 47], [85.72, 47.45], [85.77, 48.46], [86.6, 48.55], [87.36, 49.21], [87.75, 49.3], [88.01, 48.6], [88.85, 48.07], [90.28, 47.69], [90.97, 46.89], [90.59, 45.72], [90.95, 45.29], [92.13, 45.12], [93.48, 44.98], [94.69, 44.35], [95.31, 44.24], [95.76, 43.32], [96.35, 42.73], [97.45, 42.75], [99.52, 42.52], [100.85, 42.66], [101.83, 42.51], [103.31, 41.91], [104.52, 41.91], [104.96, 41.6], [106.13, 42.13], [107.74, 42.48], [109.24, 42.52], [110.41, 42.87], [111.13, 43.41], [111.83, 43.74], [111.67, 44.07], [111.35, 44.46], [111.87, 45.1], [112.44, 45.01], [113.46, 44.81], [114.46, 45.34], [115.99, 45.73], [116.72, 46.39], [117.42, 46.67], [118.87, 46.81], [119.66, 46.69], [119.77, 47.05], [118.87, 47.75], [118.06, 48.07], [117.3, 47.7], [116.31, 47.85], [115.74, 47.73], [115.49, 48.14], [116.19, 49.13], [116.68, 49.89], [117.88, 49.51], [119.29, 50.14], [119.28, 50.58], [120.18, 51.64], [120.74, 51.96], [120.73, 52.52], [120.18, 52.75], [121, 53.25], [122.25, 53.43], [123.57, 53.46], [125.07, 53.16], [125.95, 52.79], [126.56, 51.78], [126.94, 51.35], [127.29, 50.74], [127.66, 49.76], [129.4, 49.44], [130.58, 48.73], [130.99, 47.79], [132.51, 47.79], [133.37, 48.18], [135.03, 48.48], [134.5, 47.58], [134.11, 47.21], [133.77, 46.12], [133.1, 45.14], [131.88, 45.32], [131.03, 44.97], [131.29, 44.11], [131.14, 42.93], [130.63, 42.9], [130.64, 42.4], [129.99, 42.99], [129.6, 42.42], [128.05, 41.99], [128.21, 41.47], [127.34, 41.5], [126.87, 41.82], [126.18, 41.11], [125.08, 40.57], [124.27, 39.93], [122.87, 39.64], [122.13, 39.17], [121.05, 38.9], [121.59, 39.36], [121.38, 39.75], [122.17, 40.42], [121.64, 40.95], [120.77, 40.59], [119.64, 39.9], [119.02, 39.25], [118.04, 39.2], [117.53, 38.74], [118.06, 38.06], [118.88, 37.9], [118.91, 37.45], [119.7, 37.16], [120.82, 37.87], [121.71, 37.48], [122.36, 37.45], [122.52, 36.93], [121.1, 36.65], [120.64, 36.11], [119.66, 35.61], [119.15, 34.91], [120.23, 34.36], [120.62, 33.38], [121.23, 32.46], [121.91, 31.69], [121.89, 30.95], [121.26, 30.68], [121.5, 30.14], [122.09, 29.83], [121.94, 29.02], [121.68, 28.23], [121.13, 28.14], [120.4, 27.05], [119.59, 25.74], [118.66, 24.55], [117.28, 23.62], [115.89, 22.78], [114.76, 22.67], [114.15, 22.22], [113.81, 22.55], [113.24, 22.05], [111.84, 21.55], [110.79, 21.4], [110.44, 20.34], [109.89, 20.28], [109.63, 21.01], [109.86, 21.4], [108.52, 21.72], [108.05, 21.55], [107.04, 21.81], [106.57, 22.22], [106.73, 22.79], [105.81, 22.98], [105.33, 23.35], [104.48, 22.82], [103.5, 22.7], [102.71, 22.71], [102.17, 22.46], [101.65, 22.32], [101.8, 21.17], [101.27, 21.2], [101.18, 21.44], [101.15, 21.85], [100.42, 21.56], [99.98, 21.74], [99.24, 22.12], [99.53, 22.95], [98.9, 23.14], [98.66, 24.06], [97.6, 23.9], [97.72, 25.08], [98.67, 25.92], [98.71, 26.74], [98.68, 27.51], [98.25, 27.75], [97.91, 28.34], [97.33, 28.26], [96.25, 28.41], [96.59, 28.83], [96.12, 29.45], [95.4, 29.03], [94.57, 29.28], [93.41, 28.64], [92.5, 27.9], [91.7, 27.77], [91.26, 28.04], [90.73, 28.06], [90.02, 28.3], [89.48, 28.04], [88.81, 27.3], [88.73, 28.09], [88.12, 27.88], [86.95, 27.97], [85.82, 28.2], [85.01, 28.64], [84.23, 28.84], [83.9, 29.32], [83.34, 29.46], [82.33, 30.12], [81.53, 30.42], [81.11, 30.18], [79.72, 30.88], [78.74, 31.52], [78.46, 32.62], [79.18, 32.48], [79.21, 32.99], [78.81, 33.51], [78.91, 34.32], [77.84, 35.49], [76.19, 35.9], [75.9, 36.67], [75.16, 37.13], [74.98, 37.42], [74.83, 37.99], [74.86, 38.38], [74.26, 38.61], [73.93, 38.51], [73.68, 39.43], [73.96, 39.66], [73.82, 39.89], [74.78, 40.37], [75.47, 40.56], [76.53, 40.43], [76.9, 41.07], [78.19, 41.19], [78.54, 41.58], [80.12, 42.12], [80.26, 42.35]]]] } }, { type: "Feature", properties: { iso3: "TWN", имя: "Тайвань", имя_en: "Taiwan", регион: "Eastern Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[121.78, 24.39], [121.18, 22.79], [120.75, 21.97], [120.22, 22.81], [120.11, 23.56], [120.69, 24.54], [121.5, 25.3], [121.95, 25], [121.78, 24.39]]] } }, { type: "Feature", properties: { iso3: "ITA", имя: "Италия", имя_en: "Italy", регион: "Southern Europe", континент: "Europe" }, geometry: { type: "MultiPolygon", coordinates: [[[[10.44, 46.89], [11.05, 46.75], [11.16, 46.94], [12.15, 47.12], [12.38, 46.77], [13.81, 46.51], [13.7, 46.02], [13.94, 45.59], [13.14, 45.74], [12.33, 45.38], [12.38, 44.89], [12.26, 44.6], [12.59, 44.09], [13.53, 43.59], [14.03, 42.76], [15.14, 41.96], [15.93, 41.96], [16.17, 41.74], [15.89, 41.54], [16.79, 41.18], [17.52, 40.88], [18.38, 40.36], [18.48, 40.17], [18.29, 39.81], [17.74, 40.28], [16.87, 40.44], [16.45, 39.8], [17.17, 39.42], [17.05, 38.9], [16.64, 38.84], [16.1, 37.99], [15.68, 37.91], [15.69, 38.21], [15.89, 38.75], [16.11, 38.96], [15.72, 39.54], [15.41, 40.05], [15, 40.17], [14.7, 40.6], [14.06, 40.79], [13.63, 41.19], [12.89, 41.25], [12.11, 41.7], [11.19, 42.36], [10.51, 42.93], [10.2, 43.92], [9.7, 44.04], [8.89, 44.37], [8.43, 44.23], [7.85, 43.77], [7.44, 43.69], [7.55, 44.13], [7.01, 44.25], [6.75, 45.03], [7.1, 45.33], [6.8, 45.71], [6.84, 45.99], [7.27, 45.78], [7.76, 45.82], [8.32, 46.16], [8.49, 46.01], [8.97, 46.04], [9.18, 46.44], [9.92, 46.31], [10.36, 46.48], [10.44, 46.89]]], [[[14.76, 38.14], [15.52, 38.23], [15.16, 37.44], [15.31, 37.13], [15.1, 36.62], [14.34, 37], [13.83, 37.1], [12.43, 37.61], [12.57, 38.13], [13.74, 38.03], [14.76, 38.14]]], [[[8.71, 40.9], [9.21, 41.21], [9.81, 40.5], [9.67, 39.18], [9.21, 39.24], [8.81, 38.91], [8.43, 39.17], [8.39, 40.38], [8.16, 40.95], [8.71, 40.9]]]] } }, { type: "Feature", properties: { iso3: "DNK", имя: "Дания", имя_en: "Denmark", регион: "Northern Europe", континент: "Europe" }, geometry: { type: "MultiPolygon", coordinates: [[[[9.92, 54.98], [9.28, 54.83], [8.53, 54.96], [8.12, 55.52], [8.09, 56.54], [8.26, 56.81], [8.54, 57.11], [9.42, 57.17], [9.78, 57.45], [10.58, 57.73], [10.55, 57.22], [10.25, 56.89], [10.37, 56.61], [10.91, 56.46], [10.67, 56.08], [10.37, 56.19], [9.65, 55.47], [9.92, 54.98]]], [[[12.37, 56.11], [12.69, 55.61], [12.09, 54.8], [11.04, 55.36], [10.9, 55.78], [12.37, 56.11]]]] } }, { type: "Feature", properties: { iso3: "GBR", имя: "Великобритания", имя_en: "United Kingdom", регион: "Northern Europe", континент: "Europe" }, geometry: { type: "MultiPolygon", coordinates: [[[[-6.2, 53.87], [-6.95, 54.07], [-7.57, 54.06], [-7.37, 54.6], [-7.57, 55.13], [-6.73, 55.17], [-5.66, 54.55], [-6.2, 53.87]]], [[[-3.09, 53.4], [-3.09, 53.4], [-2.95, 53.98], [-3.61, 54.6], [-3.63, 54.62], [-4.84, 54.79], [-5.08, 55.06], [-4.72, 55.51], [-5.05, 55.78], [-5.59, 55.31], [-5.64, 56.28], [-6.15, 56.79], [-5.79, 57.82], [-5.01, 58.63], [-4.21, 58.55], [-3.01, 58.63], [-4.07, 57.55], [-3.06, 57.69], [-1.96, 57.68], [-2.22, 56.87], [-3.12, 55.97], [-2.09, 55.91], [-2.01, 55.8], [-1.11, 54.62], [-0.43, 54.46], [0.18, 53.33], [0.47, 52.93], [1.68, 52.74], [1.56, 52.1], [1.05, 51.81], [1.45, 51.29], [0.55, 50.77], [-0.79, 50.77], [-2.49, 50.5], [-2.96, 50.7], [-3.62, 50.23], [-4.54, 50.34], [-5.25, 49.96], [-5.78, 50.16], [-4.31, 51.21], [-3.41, 51.43], [-3.42, 51.43], [-4.98, 51.59], [-5.27, 51.99], [-4.22, 52.3], [-4.77, 52.84], [-4.58, 53.5], [-3.09, 53.4]]]] } }, { type: "Feature", properties: { iso3: "ISL", имя: "Исландия", имя_en: "Iceland", регион: "Northern Europe", континент: "Europe" }, geometry: { type: "Polygon", coordinates: [[[-14.51, 66.46], [-14.74, 65.81], [-13.61, 65.13], [-14.91, 64.36], [-17.79, 63.68], [-18.66, 63.5], [-19.97, 63.64], [-22.76, 63.96], [-21.78, 64.4], [-23.96, 64.89], [-22.18, 65.08], [-22.23, 65.38], [-24.33, 65.61], [-23.65, 66.26], [-22.13, 66.41], [-20.58, 65.73], [-19.06, 66.28], [-17.8, 65.99], [-16.17, 66.53], [-14.51, 66.46]]] } }, { type: "Feature", properties: { iso3: "AZE", имя: "Азербайджан", имя_en: "Azerbaijan", регион: "Western Asia", континент: "Asia" }, geometry: { type: "MultiPolygon", coordinates: [[[[46.4, 41.86], [46.69, 41.83], [47.37, 41.22], [47.82, 41.15], [47.99, 41.41], [48.58, 41.81], [49.11, 41.28], [49.62, 40.57], [50.08, 40.53], [50.39, 40.26], [49.57, 40.18], [49.4, 39.4], [49.22, 39.05], [48.86, 38.82], [48.88, 38.32], [48.63, 38.27], [48.01, 38.79], [48.36, 39.29], [48.06, 39.58], [47.69, 39.51], [46.51, 38.77], [46.48, 39.46], [46.03, 39.63], [45.61, 39.9], [45.89, 40.22], [45.36, 40.56], [45.56, 40.81], [45.18, 40.99], [44.97, 41.25], [45.22, 41.41], [45.96, 41.12], [46.5, 41.06], [46.64, 41.18], [46.15, 41.72], [46.4, 41.86]]], [[[46.14, 38.74], [45.46, 38.87], [44.95, 39.34], [44.79, 39.71], [45, 39.74], [45.3, 39.47], [45.74, 39.47], [45.74, 39.32], [46.14, 38.74]]]] } }, { type: "Feature", properties: { iso3: "GEO", имя: "Грузия", имя_en: "Georgia", регион: "Western Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[39.96, 43.43], [40.08, 43.55], [40.92, 43.38], [42.39, 43.22], [43.76, 42.74], [43.93, 42.55], [44.54, 42.71], [45.47, 42.5], [45.78, 42.09], [46.4, 41.86], [46.15, 41.72], [46.64, 41.18], [46.5, 41.06], [45.96, 41.12], [45.22, 41.41], [44.97, 41.25], [43.58, 41.09], [42.62, 41.58], [41.55, 41.54], [41.7, 41.96], [41.45, 42.65], [40.88, 43.01], [40.32, 43.13], [39.96, 43.43]]] } }, { type: "Feature", properties: { iso3: "PHL", имя: "Филиппины", имя_en: "Philippines", регион: "South-Eastern Asia", континент: "Asia" }, geometry: { type: "MultiPolygon", coordinates: [[[[120.83, 12.7], [120.32, 13.47], [121.18, 13.43], [121.53, 13.07], [121.26, 12.21], [120.83, 12.7]]], [[[122.59, 9.98], [122.84, 10.26], [122.95, 10.88], [123.5, 10.94], [123.34, 10.27], [124.08, 11.23], [123.98, 10.28], [123.62, 9.95], [123.31, 9.32], [123, 9.02], [122.38, 9.71], [122.59, 9.98]]], [[[126.38, 8.41], [126.48, 7.75], [126.54, 7.19], [126.2, 6.27], [125.83, 7.29], [125.36, 6.79], [125.68, 6.05], [125.4, 5.58], [124.22, 6.16], [123.94, 6.89], [124.24, 7.36], [123.61, 7.83], [123.3, 7.42], [122.83, 7.46], [122.09, 6.9], [121.92, 7.19], [122.31, 8.03], [122.94, 8.32], [123.49, 8.69], [123.84, 8.24], [124.6, 8.51], [124.76, 8.96], [125.47, 8.99], [125.41, 9.76], [126.22, 9.29], [126.31, 8.78], [126.38, 8.41]]], [[[118.5, 9.32], [117.17, 8.37], [117.66, 9.07], [118.39, 9.68], [118.99, 10.38], [119.51, 11.37], [119.69, 10.55], [119.03, 10], [118.5, 9.32]]], [[[122.34, 18.22], [122.17, 17.81], [122.52, 17.09], [122.25, 16.26], [121.66, 15.93], [121.51, 15.12], [121.73, 14.33], [122.26, 14.22], [122.7, 14.34], [123.95, 13.78], [123.86, 13.24], [124.18, 13], [124.08, 12.54], [123.3, 13.03], [122.93, 13.55], [122.67, 13.19], [122.03, 13.78], [121.13, 13.64], [120.63, 13.86], [120.68, 14.27], [120.99, 14.53], [120.69, 14.76], [120.56, 14.4], [120.07, 14.97], [119.92, 15.41], [119.88, 16.36], [120.29, 16.03], [120.39, 17.6], [120.72, 18.51], [121.32, 18.5], [121.94, 18.22], [122.25, 18.48], [122.34, 18.22]]], [[[122.04, 11.42], [121.88, 11.89], [122.48, 11.58], [123.12, 11.58], [123.1, 11.17], [122.64, 10.74], [122, 10.44], [121.97, 10.91], [122.04, 11.42]]], [[[125.5, 12.16], [125.78, 11.05], [125.01, 11.31], [125.03, 10.98], [125.28, 10.36], [124.8, 10.13], [124.76, 10.84], [124.46, 10.89], [124.3, 11.5], [124.89, 11.42], [124.88, 11.79], [124.27, 12.56], [125.23, 12.54], [125.5, 12.16]]]] } }, { type: "Feature", properties: { iso3: "MYS", имя: "Малайзия", имя_en: "Malaysia", регион: "South-Eastern Asia", континент: "Asia" }, geometry: { type: "MultiPolygon", coordinates: [[[[100.09, 6.46], [100.26, 6.64], [101.08, 6.2], [101.15, 5.69], [101.81, 5.81], [102.14, 6.22], [102.37, 6.13], [102.96, 5.52], [103.38, 4.86], [103.44, 4.18], [103.33, 3.73], [103.43, 3.38], [103.5, 2.79], [103.85, 2.52], [104.25, 1.63], [104.23, 1.29], [103.52, 1.23], [102.57, 1.97], [101.39, 2.76], [101.27, 3.27], [100.7, 3.94], [100.56, 4.77], [100.2, 5.31], [100.31, 6.04], [100.09, 6.46]]], [[[117.88, 4.14], [117.02, 4.31], [115.87, 4.31], [115.52, 3.17], [115.13, 2.82], [114.62, 1.43], [113.81, 1.22], [112.86, 1.5], [112.38, 1.41], [111.8, 0.9], [111.16, 0.98], [110.51, 0.77], [109.83, 1.34], [109.66, 2.01], [110.4, 1.66], [111.17, 1.85], [111.37, 2.7], [111.8, 2.89], [113, 3.1], [113.71, 3.89], [114.2, 4.53], [114.66, 4.01], [114.87, 4.35], [115.35, 4.32], [115.41, 4.96], [115.45, 5.45], [116.22, 6.14], [116.73, 6.92], [117.13, 6.93], [117.64, 6.42], [117.69, 5.99], [118.35, 5.71], [119.18, 5.41], [119.11, 5.02], [118.44, 4.97], [118.62, 4.48], [117.88, 4.14]]]] } }, { type: "Feature", properties: { iso3: "BRN", имя: "Бруней", имя_en: "Brunei", регион: "South-Eastern Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[115.45, 5.45], [115.41, 4.96], [115.35, 4.32], [114.87, 4.35], [114.66, 4.01], [114.2, 4.53], [114.6, 4.9], [115.45, 5.45]]] } }, { type: "Feature", properties: { iso3: "SVN", имя: "Словения", имя_en: "Slovenia", регион: "Southern Europe", континент: "Europe" }, geometry: { type: "Polygon", coordinates: [[[13.81, 46.51], [14.63, 46.43], [15.14, 46.66], [16.01, 46.68], [16.2, 46.85], [16.37, 46.84], [16.56, 46.5], [15.77, 46.24], [15.67, 45.83], [15.32, 45.73], [15.33, 45.45], [14.94, 45.47], [14.6, 45.63], [14.41, 45.47], [13.72, 45.5], [13.94, 45.59], [13.7, 46.02], [13.81, 46.51]]] } }, { type: "Feature", properties: { iso3: "FIN", имя: "Финляндия", имя_en: "Finland", регион: "Northern Europe", континент: "Europe" }, geometry: { type: "Polygon", coordinates: [[[28.59, 69.06], [28.45, 68.36], [29.98, 67.7], [29.05, 66.94], [30.22, 65.81], [29.54, 64.95], [30.44, 64.2], [30.04, 63.55], [31.52, 62.87], [31.14, 62.36], [30.21, 61.78], [28.07, 60.5], [28.07, 60.5], [28.07, 60.5], [26.26, 60.42], [24.5, 60.06], [22.87, 59.85], [22.29, 60.39], [21.32, 60.72], [21.54, 61.71], [21.06, 62.61], [21.54, 63.19], [22.44, 63.82], [24.73, 64.9], [25.4, 65.11], [25.29, 65.53], [23.9, 66.01], [23.57, 66.4], [23.54, 67.94], [21.98, 68.62], [20.65, 69.11], [21.24, 69.37], [22.36, 68.84], [23.66, 68.89], [24.74, 68.65], [25.69, 69.09], [26.18, 69.83], [27.73, 70.16], [29.02, 69.77], [28.59, 69.06]]] } }, { type: "Feature", properties: { iso3: "SVK", имя: "Словакия", имя_en: "Slovakia", регион: "Eastern Europe", континент: "Europe" }, geometry: { type: "Polygon", coordinates: [[[22.56, 49.09], [22.28, 48.83], [22.09, 48.42], [21.87, 48.32], [20.8, 48.62], [20.47, 48.56], [20.24, 48.33], [19.77, 48.2], [19.66, 48.27], [19.17, 48.11], [18.78, 48.08], [18.7, 47.88], [17.86, 47.76], [17.49, 47.87], [16.98, 48.12], [16.88, 48.47], [16.96, 48.6], [17.1, 48.82], [17.55, 48.8], [17.89, 48.9], [17.91, 49], [18.1, 49.04], [18.17, 49.27], [18.4, 49.32], [18.55, 49.5], [18.85, 49.5], [18.91, 49.44], [19.32, 49.57], [19.83, 49.22], [20.42, 49.43], [20.89, 49.33], [21.61, 49.47], [22.56, 49.09]]] } }, { type: "Feature", properties: { iso3: "CZE", имя: "Чехия", имя_en: "Czechia", регион: "Eastern Europe", континент: "Europe" }, geometry: { type: "Polygon", coordinates: [[[15.02, 51.11], [15.49, 50.78], [16.24, 50.7], [16.18, 50.42], [16.72, 50.22], [16.87, 50.47], [17.55, 50.36], [17.65, 50.05], [18.39, 49.99], [18.85, 49.5], [18.55, 49.5], [18.4, 49.32], [18.17, 49.27], [18.1, 49.04], [17.91, 49], [17.89, 48.9], [17.55, 48.8], [17.1, 48.82], [16.96, 48.6], [16.5, 48.79], [16.03, 48.73], [15.25, 49.04], [14.9, 48.96], [14.34, 48.56], [13.6, 48.88], [13.03, 49.31], [12.52, 49.55], [12.42, 49.97], [12.24, 50.27], [12.97, 50.48], [13.34, 50.73], [14.06, 50.93], [14.31, 51.12], [14.57, 51], [15.02, 51.11]]] } }, { type: "Feature", properties: { iso3: "ERI", имя: "Эритрея", имя_en: "Eritrea", регион: "Eastern Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[36.43, 14.42], [36.32, 14.82], [36.75, 16.29], [36.85, 16.96], [37.17, 17.26], [37.9, 17.43], [38.41, 18], [38.99, 16.84], [39.27, 15.92], [39.81, 15.44], [41.18, 14.49], [41.73, 13.92], [42.28, 13.34], [42.59, 13], [43.08, 12.7], [42.78, 12.46], [42.35, 12.54], [42.01, 12.87], [41.6, 13.45], [41.16, 13.77], [40.9, 14.12], [40.03, 14.52], [39.34, 14.53], [39.1, 14.74], [38.51, 14.51], [37.91, 14.96], [37.59, 14.21], [36.43, 14.42]]] } }, { type: "Feature", properties: { iso3: "JPN", имя: "Япония", имя_en: "Japan", регион: "Eastern Asia", континент: "Asia" }, geometry: { type: "MultiPolygon", coordinates: [[[[141.88, 39.18], [140.96, 38.17], [140.98, 37.14], [140.6, 36.34], [140.77, 35.84], [140.25, 35.14], [138.98, 34.67], [137.22, 34.61], [135.79, 33.46], [135.12, 33.85], [135.08, 34.6], [133.34, 34.38], [132.16, 33.9], [130.99, 33.89], [132, 33.15], [131.33, 31.45], [130.69, 31.03], [130.2, 31.42], [130.45, 32.32], [129.81, 32.61], [129.41, 33.3], [130.35, 33.6], [130.88, 34.23], [131.88, 34.75], [132.62, 35.43], [134.61, 35.73], [135.68, 35.53], [136.72, 37.3], [137.39, 36.83], [138.86, 37.83], [139.43, 38.22], [140.05, 39.44], [139.88, 40.56], [140.31, 41.2], [141.37, 41.38], [141.91, 39.99], [141.88, 39.18]]], [[[144.61, 43.96], [145.32, 44.38], [145.54, 43.26], [144.06, 42.99], [143.18, 42], [141.61, 42.68], [141.07, 41.58], [139.96, 41.57], [139.82, 42.56], [140.31, 43.33], [141.38, 43.39], [141.67, 44.77], [141.97, 45.55], [143.14, 44.51], [143.91, 44.17], [144.61, 43.96]]], [[[132.37, 33.46], [132.92, 34.06], [133.49, 33.94], [133.9, 34.36], [134.64, 34.15], [134.77, 33.81], [134.2, 33.2], [133.79, 33.52], [133.28, 33.29], [133.01, 32.7], [132.36, 32.99], [132.37, 33.46]]]] } }, { type: "Feature", properties: { iso3: "PRY", имя: "Парагвай", имя_en: "Paraguay", регион: "South America", континент: "South America" }, geometry: { type: "Polygon", coordinates: [[[-58.17, -20.18], [-57.87, -20.73], [-57.94, -22.09], [-56.88, -22.28], [-56.47, -22.09], [-55.8, -22.36], [-55.61, -22.66], [-55.52, -23.57], [-55.4, -23.96], [-55.03, -24], [-54.65, -23.84], [-54.29, -24.02], [-54.29, -24.57], [-54.43, -25.16], [-54.63, -25.74], [-54.79, -26.62], [-55.7, -27.39], [-56.49, -27.55], [-57.61, -27.4], [-58.62, -27.12], [-57.63, -25.6], [-57.78, -25.16], [-58.81, -24.77], [-60.03, -24.03], [-60.85, -23.88], [-62.69, -22.25], [-62.29, -21.05], [-62.27, -20.51], [-61.79, -19.63], [-60.04, -19.34], [-59.12, -19.36], [-58.18, -19.87], [-58.17, -20.18]]] } }, { type: "Feature", properties: { iso3: "YEM", имя: "Йемен", имя_en: "Yemen", регион: "Western Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[52, 19], [52.78, 17.35], [53.11, 16.65], [52.39, 16.38], [52.19, 15.94], [52.17, 15.6], [51.17, 15.18], [49.57, 14.71], [48.68, 14], [48.24, 13.95], [47.94, 14.01], [47.35, 13.59], [46.72, 13.4], [45.88, 13.35], [45.63, 13.29], [45.41, 13.03], [45.14, 12.95], [44.99, 12.7], [44.49, 12.72], [44.18, 12.59], [43.48, 12.64], [43.22, 13.22], [43.25, 13.77], [43.09, 14.06], [42.89, 14.8], [42.6, 15.21], [42.81, 15.26], [42.7, 15.72], [42.82, 15.91], [42.78, 16.35], [43.22, 16.67], [43.12, 17.09], [43.38, 17.58], [43.79, 17.32], [44.06, 17.41], [45.22, 17.43], [45.4, 17.33], [46.37, 17.23], [46.75, 17.28], [47, 16.95], [47.47, 17.12], [48.18, 18.17], [49.12, 18.62], [52, 19]]] } }, { type: "Feature", properties: { iso3: "SAU", имя: "Саудовская Аравия", имя_en: "Saudi Arabia", регион: "Western Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[34.96, 29.36], [36.07, 29.2], [36.5, 29.51], [36.74, 29.87], [37.5, 30], [37.67, 30.34], [38, 30.51], [37, 31.51], [39, 32.01], [39.2, 32.16], [40.4, 31.89], [41.89, 31.19], [44.71, 29.18], [46.57, 29.1], [47.46, 29], [47.71, 28.53], [48.42, 28.55], [48.81, 27.69], [49.3, 27.46], [49.47, 27.11], [50.15, 26.69], [50.21, 26.28], [50.11, 25.94], [50.24, 25.61], [50.53, 25.33], [50.66, 25], [50.81, 24.75], [51.11, 24.56], [51.39, 24.63], [51.58, 24.25], [51.62, 24.01], [52, 23], [55.01, 22.5], [55.21, 22.71], [55.67, 22], [55, 20], [52, 19], [49.12, 18.62], [48.18, 18.17], [47.47, 17.12], [47, 16.95], [46.75, 17.28], [46.37, 17.23], [45.4, 17.33], [45.22, 17.43], [44.06, 17.41], [43.79, 17.32], [43.38, 17.58], [43.12, 17.09], [43.22, 16.67], [42.78, 16.35], [42.65, 16.77], [42.35, 17.08], [42.27, 17.47], [41.75, 17.83], [41.22, 18.67], [40.94, 19.49], [40.25, 20.17], [39.8, 20.34], [39.14, 21.29], [39.02, 21.99], [39.07, 22.58], [38.49, 23.69], [38.02, 24.08], [37.48, 24.29], [37.15, 24.86], [37.21, 25.08], [36.93, 25.6], [36.64, 25.83], [36.25, 26.57], [35.64, 27.38], [35.13, 28.06], [34.63, 28.06], [34.79, 28.61], [34.83, 28.96], [34.96, 29.36]]] } }, { type: "Feature", properties: { iso3: "CYP", имя: "Кипр", имя_en: "Cyprus", регион: "Western Asia", континент: "Asia" }, geometry: { type: "Polygon", coordinates: [[[32.73, 35.14], [32.92, 35.09], [33.19, 35.17], [33.38, 35.16], [33.46, 35.1], [33.48, 35], [33.53, 35.04], [33.68, 35.02], [33.87, 35.09], [33.97, 35.06], [34, 34.98], [32.98, 34.57], [32.49, 34.7], [32.26, 35.1], [32.73, 35.14]]] } }, { type: "Feature", properties: { iso3: "MAR", имя: "Марокко", имя_en: "Morocco", регион: "Northern Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[-2.17, 35.17], [-1.79, 34.53], [-1.73, 33.92], [-1.39, 32.86], [-1.12, 32.65], [-1.31, 32.26], [-2.62, 32.09], [-3.07, 31.72], [-3.65, 31.64], [-3.69, 30.9], [-4.86, 30.5], [-5.24, 30], [-6.06, 29.73], [-7.06, 29.58], [-8.67, 28.84], [-8.67, 27.66], [-8.82, 27.66], [-8.79, 27.12], [-9.41, 27.09], [-9.74, 26.86], [-10.19, 26.86], [-10.55, 26.99], [-11.39, 26.88], [-11.72, 26.1], [-12.03, 26.03], [-12.5, 24.77], [-13.89, 23.69], [-14.22, 22.31], [-14.63, 21.86], [-14.75, 21.5], [-17, 21.42], [-17.02, 21.42], [-16.97, 21.89], [-16.59, 22.16], [-16.26, 22.68], [-16.33, 23.02], [-15.98, 23.72], [-15.43, 24.36], [-15.09, 24.52], [-14.82, 25.1], [-14.8, 25.64], [-14.44, 26.25], [-13.77, 26.62], [-13.14, 27.64], [-13.12, 27.65], [-12.62, 28.04], [-11.69, 28.15], [-10.9, 28.83], [-10.4, 29.1], [-9.56, 29.93], [-9.81, 31.18], [-9.43, 32.04], [-9.3, 32.56], [-8.66, 33.24], [-7.65, 33.7], [-6.91, 34.11], [-6.24, 35.15], [-5.93, 35.76], [-5.19, 35.76], [-4.59, 35.33], [-3.64, 35.4], [-2.6, 35.18], [-2.17, 35.17]]] } }, { type: "Feature", properties: { iso3: "EGY", имя: "Египет", имя_en: "Egypt", регион: "Northern Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[36.87, 22], [32.9, 22], [29.02, 22], [25, 22], [25, 25.68], [25, 29.24], [24.7, 30.04], [24.96, 30.66], [24.8, 31.09], [25.16, 31.57], [26.5, 31.59], [27.46, 31.32], [28.45, 31.03], [28.91, 30.87], [29.68, 31.19], [30.1, 31.47], [30.98, 31.56], [31.69, 31.43], [31.96, 30.93], [32.19, 31.26], [32.99, 31.02], [33.77, 30.97], [34.27, 31.22], [34.27, 31.22], [34.82, 29.76], [34.92, 29.5], [34.64, 29.1], [34.43, 28.34], [34.15, 27.82], [33.92, 27.65], [33.59, 27.97], [33.14, 28.42], [32.42, 29.85], [32.32, 29.76], [32.73, 28.71], [33.35, 27.7], [34.1, 26.14], [34.47, 25.6], [34.8, 25.03], [35.69, 23.93], [35.49, 23.75], [35.53, 23.1], [36.69, 22.2], [36.87, 22]]] } }, { type: "Feature", properties: { iso3: "LBY", имя: "Ливия", имя_en: "Libya", регион: "Northern Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[25, 22], [25, 20], [23.85, 20], [23.84, 19.58], [19.85, 21.5], [15.86, 23.41], [14.85, 22.86], [14.14, 22.49], [13.58, 23.04], [12, 23.47], [11.56, 24.1], [10.77, 24.56], [10.3, 24.38], [9.95, 24.94], [9.91, 25.37], [9.32, 26.09], [9.72, 26.51], [9.63, 27.14], [9.76, 27.69], [9.68, 28.14], [9.86, 28.96], [9.81, 29.42], [9.48, 30.31], [9.97, 30.54], [10.06, 30.96], [9.95, 31.38], [10.64, 31.76], [10.94, 32.08], [11.43, 32.37], [11.49, 33.14], [12.66, 32.79], [13.08, 32.88], [13.92, 32.71], [15.25, 32.27], [15.71, 31.38], [16.61, 31.18], [18.02, 30.76], [19.09, 30.27], [19.57, 30.53], [20.05, 30.99], [19.82, 31.75], [20.13, 32.24], [20.85, 32.71], [21.54, 32.84], [22.9, 32.64], [23.24, 32.19], [23.61, 32.19], [23.93, 32.02], [24.92, 31.9], [25.16, 31.57], [24.8, 31.09], [24.96, 30.66], [24.7, 30.04], [25, 29.24], [25, 25.68], [25, 22]]] } }, { type: "Feature", properties: { iso3: "ETH", имя: "Эфиопия", имя_en: "Ethiopia", регион: "Eastern Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[47.79, 8], [44.96, 5], [43.66, 4.96], [42.77, 4.25], [42.13, 4.23], [41.86, 3.92], [41.17, 3.92], [40.77, 4.26], [39.85, 3.84], [39.56, 3.42], [38.89, 3.5], [38.67, 3.62], [38.44, 3.59], [38.12, 3.6], [36.86, 4.45], [36.16, 4.45], [35.82, 4.78], [35.82, 5.34], [35.3, 5.51], [34.71, 6.59], [34.25, 6.83], [34.08, 7.23], [33.57, 7.71], [32.95, 7.78], [33.29, 8.35], [33.83, 8.38], [33.97, 8.68], [33.96, 9.58], [34.26, 10.63], [34.73, 10.91], [34.83, 11.32], [35.26, 12.08], [35.86, 12.58], [36.27, 13.56], [36.43, 14.42], [37.59, 14.21], [37.91, 14.96], [38.51, 14.51], [39.1, 14.74], [39.34, 14.53], [40.03, 14.52], [40.9, 14.12], [41.16, 13.77], [41.6, 13.45], [42.01, 12.87], [42.35, 12.54], [42, 12.1], [41.66, 11.63], [41.74, 11.36], [41.76, 11.05], [42.31, 11.03], [42.55, 11.11], [42.78, 10.93], [42.56, 10.57], [42.93, 10.02], [43.3, 9.54], [43.68, 9.18], [46.95, 8], [47.79, 8]]] } }, { type: "Feature", properties: { iso3: "DJI", имя: "Джибути", имя_en: "Djibouti", регион: "Eastern Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[42.35, 12.54], [42.78, 12.46], [43.08, 12.7], [43.32, 12.39], [43.29, 11.97], [42.72, 11.74], [43.15, 11.46], [42.78, 10.93], [42.55, 11.11], [42.31, 11.03], [41.76, 11.05], [41.74, 11.36], [41.66, 11.63], [42, 12.1], [42.35, 12.54]]] } }, { type: "Feature", properties: { iso3: "UGA", имя: "Уганда", имя_en: "Uganda", регион: "Eastern Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[33.9, -0.95], [31.87, -1.03], [30.77, -1.01], [30.42, -1.13], [29.82, -1.44], [29.58, -1.34], [29.59, -0.59], [29.82, -0.21], [29.88, 0.6], [30.09, 1.06], [30.47, 1.58], [30.85, 1.85], [31.17, 2.2], [30.77, 2.34], [30.83, 3.51], [30.83, 3.51], [31.25, 3.78], [31.88, 3.56], [32.69, 3.79], [33.39, 3.79], [34.01, 4.25], [34.48, 3.56], [34.6, 3.05], [35.04, 1.91], [34.67, 1.18], [34.18, 0.52], [33.89, 0.11], [33.9, -0.95]]] } }, { type: "Feature", properties: { iso3: "RWA", имя: "Руанда", имя_en: "Rwanda", регион: "Eastern Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[30.42, -1.13], [30.82, -1.7], [30.76, -2.29], [30.47, -2.41], [30.47, -2.41], [29.94, -2.35], [29.63, -2.92], [29.02, -2.84], [29.12, -2.29], [29.25, -2.22], [29.29, -1.62], [29.58, -1.34], [29.82, -1.44], [30.42, -1.13]]] } }, { type: "Feature", properties: { iso3: "BIH", имя: "Босния и Герцеговина", имя_en: "Bosnia and Herz.", регион: "Southern Europe", континент: "Europe" }, geometry: { type: "Polygon", coordinates: [[[18.56, 42.65], [17.67, 43.03], [17.3, 43.45], [16.92, 43.67], [16.46, 44.04], [16.24, 44.35], [15.75, 44.82], [15.96, 45.23], [16.32, 45], [16.53, 45.21], [17, 45.23], [17.86, 45.07], [18.55, 45.08], [19.01, 44.86], [19.01, 44.86], [19.37, 44.86], [19.12, 44.42], [19.6, 44.04], [19.45, 43.57], [19.22, 43.52], [19.03, 43.43], [18.71, 43.2], [18.56, 42.65]]] } }, { type: "Feature", properties: { iso3: "MKD", имя: "Северная Македония", имя_en: "North Macedonia", регион: "Southern Europe", континент: "Europe" }, geometry: { type: "Polygon", coordinates: [[[22.38, 42.32], [22.88, 42], [22.95, 41.34], [22.76, 41.3], [22.6, 41.13], [22.06, 41.15], [21.67, 40.93], [21.02, 40.84], [20.61, 41.09], [20.46, 41.52], [20.59, 41.86], [20.59, 41.86], [20.72, 41.85], [20.76, 42.05], [21.35, 42.21], [21.58, 42.25], [21.92, 42.3], [22.38, 42.32]]] } }, { type: "Feature", properties: { iso3: "SRB", имя: "Сербия", имя_en: "Serbia", регион: "Southern Europe", континент: "Europe" }, geometry: { type: "Polygon", coordinates: [[[18.83, 45.91], [18.83, 45.91], [19.6, 46.17], [20.22, 46.13], [20.76, 45.73], [20.87, 45.42], [21.48, 45.18], [21.56, 44.77], [22.15, 44.48], [22.46, 44.7], [22.71, 44.58], [22.47, 44.41], [22.66, 44.23], [22.41, 44.01], [22.5, 43.64], [22.99, 43.21], [22.6, 42.9], [22.44, 42.58], [22.55, 42.46], [22.38, 42.32], [21.92, 42.3], [21.58, 42.25], [21.54, 42.32], [21.66, 42.44], [21.78, 42.68], [21.63, 42.68], [21.44, 42.86], [21.27, 42.91], [21.14, 43.07], [20.96, 43.13], [20.81, 43.27], [20.64, 43.22], [20.5, 42.88], [20.26, 42.81], [20.34, 42.9], [19.96, 43.11], [19.63, 43.21], [19.48, 43.35], [19.22, 43.52], [19.45, 43.57], [19.6, 44.04], [19.12, 44.42], [19.37, 44.86], [19.01, 44.86], [19.01, 44.86], [19.39, 45.24], [19.07, 45.52], [18.83, 45.91]]] } }, { type: "Feature", properties: { iso3: "MNE", имя: "Черногория", имя_en: "Montenegro", регион: "Southern Europe", континент: "Europe" }, geometry: { type: "Polygon", coordinates: [[[20.07, 42.59], [19.8, 42.5], [19.74, 42.69], [19.3, 42.2], [19.37, 41.88], [19.16, 41.96], [18.88, 42.28], [18.45, 42.48], [18.56, 42.65], [18.71, 43.2], [19.03, 43.43], [19.22, 43.52], [19.48, 43.35], [19.63, 43.21], [19.96, 43.11], [20.34, 42.9], [20.26, 42.81], [20.07, 42.59]]] } }, { type: "Feature", properties: { iso3: "TTO", имя: "Тринидад и Тобаго", имя_en: "Trinidad and Tobago", регион: "Caribbean", континент: "North America" }, geometry: { type: "Polygon", coordinates: [[[-61.68, 10.76], [-61.1, 10.89], [-60.9, 10.86], [-60.94, 10.11], [-61.77, 10], [-61.95, 10.09], [-61.66, 10.37], [-61.68, 10.76]]] } }, { type: "Feature", properties: { iso3: "SSD", имя: "Южный Судан", имя_en: "S. Sudan", регион: "Eastern Africa", континент: "Africa" }, geometry: { type: "Polygon", coordinates: [[[30.83, 3.51], [29.95, 4.17], [29.72, 4.6], [29.16, 4.39], [28.7, 4.46], [28.43, 4.29], [27.98, 4.41], [27.37, 5.23], [27.21, 5.55], [26.47, 5.95], [26.21, 6.55], [25.8, 6.98], [25.12, 7.5], [25.11, 7.83], [24.57, 8.23], [23.89, 8.62], [24.19, 8.73], [24.54, 8.92], [24.79, 9.81], [25.07, 10.27], [25.79, 10.41], [25.96, 10.14], [26.48, 9.55], [26.75, 9.47], [27.11, 9.64], [27.83, 9.6], [27.97, 9.4], [28.97, 9.4], [29, 9.6], [29.52, 9.79], [29.62, 10.08], [30, 10.29], [30.84, 9.71], [31.35, 9.81], [31.85, 10.53], [32.4, 11.08], [32.31, 11.68], [32.07, 11.97], [32.67, 12.02], [32.74, 12.25], [33.21, 12.18], [33.09, 11.44], [33.21, 10.72], [33.72, 10.33], [33.84, 9.98], [33.82, 9.48], [33.96, 9.46], [33.97, 8.68], [33.83, 8.38], [33.29, 8.35], [32.95, 7.78], [33.57, 7.71], [34.08, 7.23], [34.25, 6.83], [34.71, 6.59], [35.3, 5.51], [34.62, 4.85], [34.01, 4.25], [33.39, 3.79], [32.69, 3.79], [31.88, 3.56], [31.25, 3.78], [30.83, 3.51]]] } }] };

  // src/data/places.json
  var places_default = [
    {
      id: "naica",
      nameRu: "Пещера кристаллов (Найка)",
      nameEn: "Cave of the Crystals (Naica)",
      country: "Mexico",
      countryRu: "Мексика",
      lat: 27.85083333,
      lon: -105.49638889,
      kind: "crystal",
      wow: 1,
      card: "Комната на глубине 300 метров, где кристаллы выше человека, воздух почти 60 градусов — и её снова затопило.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Cristales_cueva_de_Naica.JPG?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Cristales_cueva_de_Naica.JPG?width=360",
          author: "Alexander Van Driessche",
          license: "CC BY 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3ACristales_cueva_de_Naica.JPG"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Ima.6_cristalls_de_Naica.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Ima.6_cristalls_de_Naica.jpg?width=360",
          author: "CarolGC",
          license: "CC BY-SA 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3AIma.6_cristalls_de_Naica.jpg"
        }
      ],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://en.wikipedia.org/wiki/Cave_of_the_Crystals",
          label: "en.wikipedia.org"
        }
      ],
      report: "wow-candidates"
    },
    {
      id: "hal-saflieni",
      nameRu: "Гипогей Хал-Сафлиени",
      nameEn: "Ħal Saflieni Hypogeum",
      country: "Malta",
      countryRu: "Мальта",
      lat: 35.86958333,
      lon: 14.50680556,
      kind: "temple",
      wow: 2,
      card: "Подземный храм в три яруса, с останками тысяч людей — и источники расходятся в датах на целые века.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Hal_Saflieni_Hypogeum_%E2%80%93_Upper_Level.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Hal_Saflieni_Hypogeum_%E2%80%93_Upper_Level.jpg?width=360",
          author: "xiquinhosilva",
          license: "CC BY 2.0",
          page: "https://commons.wikimedia.org/wiki/File%3AHal_Saflieni_Hypogeum_%E2%80%93_Upper_Level.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Richard_Ellis%2C_Hal_Saflieni_Hypogeum_(passage_in_lower_storey).jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Richard_Ellis%2C_Hal_Saflieni_Hypogeum_(passage_in_lower_storey).jpg?width=360",
          author: "Richard Ellis",
          license: "Public domain",
          page: "https://commons.wikimedia.org/wiki/File%3ARichard_Ellis%2C_Hal_Saflieni_Hypogeum_%28passage_in_lower_storey%29.jpg"
        }
      ],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://heritagemalta.org/hal-saflieni-hypogeum/",
          label: "heritagemalta.org"
        },
        {
          url: "https://en.wikipedia.org/wiki/%C4%A6al_Saflieni_Hypogeum",
          label: "en.wikipedia.org"
        },
        {
          url: "https://whc.unesco.org/en/list/130/",
          label: "whc.unesco.org"
        }
      ],
      report: "wow-candidates"
    },
    {
      id: "son-doong",
      nameRu: "Пещера Шондонг",
      nameEn: "Hang Sơn Đoòng",
      country: "Vietnam",
      countryRu: "Вьетнам",
      lat: 17.45694444,
      lon: 106.2875,
      kind: "cave",
      wow: 3,
      card: "Пещера, внутри которой своя река, и её называют самым большим пещерным ходом на Земле.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Son_Doong_Cave_DB_(1).jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Son_Doong_Cave_DB_(1).jpg?width=360",
          author: "Dave Bunnell",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3ASon_Doong_Cave_DB_%281%29.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Son_Doong_Cave_5.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Son_Doong_Cave_5.jpg?width=360",
          author: "Doug Knuth from Woodstock, IL",
          license: "CC BY-SA 2.0",
          page: "https://commons.wikimedia.org/wiki/File%3ASon_Doong_Cave_5.jpg"
        }
      ],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://en.wikipedia.org/wiki/Hang_S%C6%A1n_%C4%90o%C3%B2ng",
          label: "en.wikipedia.org"
        }
      ],
      report: "wow-candidates"
    },
    {
      id: "longyou",
      nameRu: "Пещеры Лунъю",
      nameEn: "Longyou Caves",
      country: "China",
      countryRu: "Китай",
      lat: 29.06157,
      lon: 119.18403,
      kind: "cave",
      wow: 5,
      card: "Двадцать четыре огромных зала в песчанике, и никто не может сказать, кто и когда их вырубил.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Longyou_Xiaonanhai_Shishi_2016.12.11_16-10-51.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Longyou_Xiaonanhai_Shishi_2016.12.11_16-10-51.jpg?width=360",
          author: "Zhangzhugang",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3ALongyou_Xiaonanhai_Shishi_2016.12.11_16-10-51.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Longyou_Xiaonanhai_Shishi_2016.12.11_16-04-56.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Longyou_Xiaonanhai_Shishi_2016.12.11_16-04-56.jpg?width=360",
          author: "Zhangzhugang",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3ALongyou_Xiaonanhai_Shishi_2016.12.11_16-04-56.jpg"
        }
      ],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://en.wikipedia.org/wiki/Longyou_Caves",
          label: "en.wikipedia.org"
        }
      ],
      report: "wow-candidates"
    },
    {
      id: "damanhur",
      nameRu: "Храмы человечества (Даманхур)",
      nameEn: "Temples of Humankind (Damanhur)",
      country: "Italy",
      countryRu: "Италия",
      lat: 45.417859,
      lon: 7.747246,
      kind: "temple",
      wow: 6,
      card: "Люди тайно вырыли храмы на 30 метров под Альпами, а прокурор пригрозил взорвать холм, если их не покажут.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Templi_dell'Umanit%C3%A0_Damanhur.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Templi_dell'Umanit%C3%A0_Damanhur.jpg?width=360",
          author: "Gufo Mandragora",
          license: "Public domain",
          page: "https://commons.wikimedia.org/wiki/File%3ATempli_dell%27Umanit%C3%A0_Damanhur.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/%D0%92_%D0%BF%D0%BE%D0%B4%D0%B7%D0%B5%D0%BC%D0%B5%D0%BB%D1%8C%D0%B5_Damanhur_-_panoramio.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/%D0%92_%D0%BF%D0%BE%D0%B4%D0%B7%D0%B5%D0%BC%D0%B5%D0%BB%D1%8C%D0%B5_Damanhur_-_panoramio.jpg?width=360",
          author: "Oleg Andriychuk",
          license: "CC BY 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3A%D0%92_%D0%BF%D0%BE%D0%B4%D0%B7%D0%B5%D0%BC%D0%B5%D0%BB%D1%8C%D0%B5_Damanhur_-_panoramio.jpg"
        }
      ],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://en.wikipedia.org/wiki/Temples_of_Humankind",
          label: "en.wikipedia.org"
        }
      ],
      report: "wow-candidates"
    },
    {
      id: "salina-turda",
      nameRu: "Салина Турда",
      nameEn: "Salina Turda",
      country: "Romania",
      countryRu: "Румыния",
      lat: 46.5877084,
      lon: 23.7873963,
      kind: "mine",
      wow: 7,
      card: "Соляной зал 42 на 50 на 80 метров — и в него спускаешься по 172 ступеням.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Rudolfmijn_Salina_Turda.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Rudolfmijn_Salina_Turda.jpg?width=360",
          author: "Rkoster",
          license: "CC BY 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3ARudolfmijn_Salina_Turda.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Tereziamijn_Salina_Turda.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Tereziamijn_Salina_Turda.jpg?width=360",
          author: "Rkoster",
          license: "CC BY 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3ATereziamijn_Salina_Turda.jpg"
        }
      ],
      models: [
        {
          title: "Salina Turda 1",
          embed: "https://sketchfab.com/models/033e5afd947e426586a2dc001dafbbe4/embed",
          page: "https://sketchfab.com/3d-models/salina-turda-1-033e5afd947e426586a2dc001dafbbe4",
          author: "",
          license: "CC Attribution (Sketchfab). Downloadable according to the API."
        },
        {
          title: "MINA RUDOLF",
          embed: "https://sketchfab.com/models/4681a8ee4ff64fdeac97ecd02700cc55/embed",
          page: "https://sketchfab.com/3d-models/mina-rudolf-4681a8ee4ff64fdeac97ecd02700cc55",
          author: "",
          license: "CC Attribution (Sketchfab). Scan of the Rudolf and Terezia rooms."
        }
      ],
      tours: [],
      sources: [
        {
          url: "https://www.salinaturda.eu/en/locatie/rudolf-mine/",
          label: "salinaturda.eu"
        },
        {
          url: "https://en.wikipedia.org/wiki/Salina_Turda",
          label: "en.wikipedia.org"
        },
        {
          url: "https://www.salinaturda.eu/en/",
          label: "salinaturda.eu"
        }
      ],
      report: "wow-candidates"
    },
    {
      id: "kailasa",
      nameRu: "Храм Кайласа (Эллора)",
      nameEn: "Kailasa Temple, Ellora",
      country: "India",
      countryRu: "Индия",
      lat: 20.02388889,
      lon: 75.17916667,
      kind: "temple",
      wow: 8,
      card: "Целый храм вырезан сверху вниз из одной базальтовой скалы: вершина на 32,6 метра над двором.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Ellora_Caves%2C_India%2C_Kailasa_Temple.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Ellora_Caves%2C_India%2C_Kailasa_Temple.jpg?width=360",
          author: "Vyacheslav Argenberg",
          license: "CC BY 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3AEllora_Caves%2C_India%2C_Kailasa_Temple.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Courtyard_and_Mahabharata_Reliefs_at_the_Kailasa_Temple%2C_Ellora_01.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Courtyard_and_Mahabharata_Reliefs_at_the_Kailasa_Temple%2C_Ellora_01.jpg?width=360",
          author: "Rohit Sharma",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3ACourtyard_and_Mahabharata_Reliefs_at_the_Kailasa_Temple%2C_Ellora_01.jpg"
        }
      ],
      models: [
        {
          title: "Ellora Caves | India (the complex, not only Cave 16)",
          embed: "https://sketchfab.com/models/1a5ec1e212f9451e80dc051e97164d17/embed",
          page: "https://sketchfab.com/3d-models/ellora-caves-india-1a5ec1e212f9451e80dc051e97164d17",
          author: "",
          license: "CC Attribution (Sketchfab). Downloadable according to the API."
        }
      ],
      tours: [],
      sources: [
        {
          url: "https://en.wikipedia.org/wiki/Kailasa_Temple,_Ellora",
          label: "en.wikipedia.org"
        },
        {
          url: "https://whc.unesco.org/en/list/243/",
          label: "whc.unesco.org"
        }
      ],
      report: "wow-candidates"
    },
    {
      id: "serapeum",
      nameRu: "Серапеум Саккары",
      nameEn: "Serapeum of Saqqara",
      country: "Egypt",
      countryRu: "Египет",
      lat: 29.87472222,
      lon: 31.21241667,
      kind: "tomb",
      wow: 9,
      card: "Подземная галерея, где священных быков хоронили в саркофагах примерно по 40 тонн.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Apis_Sarcophagus_of_Khabash.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Apis_Sarcophagus_of_Khabash.jpg?width=360",
          author: "Carole Raddato",
          license: "CC BY-SA 2.0",
          page: "https://commons.wikimedia.org/wiki/File%3AApis_Sarcophagus_of_Khabash.jpg"
        }
      ],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://en.wikipedia.org/wiki/Serapeum_of_Saqqara",
          label: "en.wikipedia.org"
        }
      ],
      report: "wow-candidates"
    },
    {
      id: "zipaquira",
      nameRu: "Соляной собор Сипакиры",
      nameEn: "Salt Cathedral of Zipaquirá",
      country: "Colombia",
      countryRu: "Колумбия",
      lat: 5.01876,
      lon: -74.0093,
      kind: "temple",
      wow: 10,
      card: "Действующая церковь внутри соляной горы, на глубине 200 метров.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Salt_Cathedral_in_Zipaquira_angel.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Salt_Cathedral_in_Zipaquira_angel.jpg?width=360",
          author: "Michael Tieso",
          license: "CC0",
          page: "https://commons.wikimedia.org/wiki/File%3ASalt_Cathedral_in_Zipaquira_angel.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Salt_Cathedral_of_Zipaquir%C3%A1_main_altar.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Salt_Cathedral_of_Zipaquir%C3%A1_main_altar.jpg?width=360",
          author: "Novoaparra",
          license: "CC BY-SA 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3ASalt_Cathedral_of_Zipaquir%C3%A1_main_altar.jpg"
        }
      ],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://en.wikipedia.org/wiki/Salt_Cathedral_of_Zipaquir%C3%A1",
          label: "en.wikipedia.org"
        }
      ],
      report: "wow-candidates"
    },
    {
      id: "bulla-regia",
      nameRu: "Булла-Регия",
      nameEn: "Bulla Regia",
      country: "Tunisia",
      countryRu: "Тунис",
      lat: 36.55861111,
      lon: 8.75388889,
      kind: "dwellings",
      wow: 11,
      card: "Римляне в Африке ушли жить этажом ниже, чтобы спастись от солнца, и мозаики до сих пор на полу.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bulla_regia_42.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Bulla_regia_42.jpg?width=360",
          author: "Wael Ghabara",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3ABulla_regia_42.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bulla_regia_45.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Bulla_regia_45.jpg?width=360",
          author: "Wael Ghabara",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3ABulla_regia_45.jpg"
        }
      ],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://en.wikipedia.org/wiki/Bulla_Regia",
          label: "en.wikipedia.org"
        }
      ],
      report: "wow-candidates"
    },
    {
      id: "orda",
      nameRu: "Ординская пещера",
      nameEn: "Orda Cave",
      country: "Russia",
      countryRu: "Россия",
      lat: 57.182,
      lon: 56.88805556,
      kind: "cave",
      wow: 12,
      card: "Гипсовая пещера, почти целиком под водой: из 5,1 км около 4,8 км затоплены.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/In_Ordinskaya_cave.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/In_Ordinskaya_cave.jpg?width=360",
          author: "Maximovich Nikolay",
          license: "CC BY 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3AIn_Ordinskaya_cave.jpg"
        }
      ],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://en.wikipedia.org/wiki/Orda_Cave",
          label: "en.wikipedia.org"
        }
      ],
      report: "wow-candidates"
    },
    {
      id: "kapova",
      nameRu: "Капова пещера (Шульган-Таш)",
      nameEn: "Kapova Cave (Shulgan-Tash)",
      country: "Russia",
      countryRu: "Россия",
      lat: 53.04441667,
      lon: 57.06388889,
      kind: "cave",
      wow: 13,
      card: "В уральской пещере нарисовали мамонтов и двугорбого верблюда — палеолит нашёлся не только в Европе.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/%D0%A0%D0%B8%D1%81%D1%83%D0%BD%D0%BA%D0%B8_%D0%B2_%D0%9A%D0%B0%D0%BF%D0%BE%D0%B2%D0%BE%D0%B9_%D0%BF%D0%B5%D1%89%D0%B5%D1%80%D0%B5_(%D0%BF%D0%B5%D1%89%D0%B5%D1%80%D0%B5_%D0%A8%D1%83%D0%BB%D1%8C%D0%B3%D0%B0%D0%BD-%D0%A2%D0%B0%D1%88).jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/%D0%A0%D0%B8%D1%81%D1%83%D0%BD%D0%BA%D0%B8_%D0%B2_%D0%9A%D0%B0%D0%BF%D0%BE%D0%B2%D0%BE%D0%B9_%D0%BF%D0%B5%D1%89%D0%B5%D1%80%D0%B5_(%D0%BF%D0%B5%D1%89%D0%B5%D1%80%D0%B5_%D0%A8%D1%83%D0%BB%D1%8C%D0%B3%D0%B0%D0%BD-%D0%A2%D0%B0%D1%88).jpg?width=360",
          author: "Марина Валиуллина",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3A%D0%A0%D0%B8%D1%81%D1%83%D0%BD%D0%BA%D0%B8_%D0%B2_%D0%9A%D0%B0%D0%BF%D0%BE%D0%B2%D0%BE%D0%B9_%D0%BF%D0%B5%D1%89%D0%B5%D1%80%D0%B5_%28%D0%BF%D0%B5%D1%89%D0%B5%D1%80%D0%B5_%D0%A8%D1%83%D0%BB%D1%8C%D0%B3%D0%B0%D0%BD-%D0%A2%D0%B0%D1%88%29.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/%D0%A0%D0%B8%D1%81%D1%83%D0%BD%D0%BA%D0%B8_%D0%B4%D1%80%D0%B5%D0%B2%D0%BD%D0%B8%D1%85_%D0%BB%D1%8E%D0%B4%D0%B5%D0%B9_%D0%B2_%D0%9A%D0%B0%D0%BF%D0%BE%D0%B2%D0%BE%D0%B9_%D0%BF%D0%B5%D1%89%D0%B5%D1%80%D0%B5.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/%D0%A0%D0%B8%D1%81%D1%83%D0%BD%D0%BA%D0%B8_%D0%B4%D1%80%D0%B5%D0%B2%D0%BD%D0%B8%D1%85_%D0%BB%D1%8E%D0%B4%D0%B5%D0%B9_%D0%B2_%D0%9A%D0%B0%D0%BF%D0%BE%D0%B2%D0%BE%D0%B9_%D0%BF%D0%B5%D1%89%D0%B5%D1%80%D0%B5.jpg?width=360",
          author: "Марина Валиуллина",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3A%D0%A0%D0%B8%D1%81%D1%83%D0%BD%D0%BA%D0%B8_%D0%B4%D1%80%D0%B5%D0%B2%D0%BD%D0%B8%D1%85_%D0%BB%D1%8E%D0%B4%D0%B5%D0%B9_%D0%B2_%D0%9A%D0%B0%D0%BF%D0%BE%D0%B2%D0%BE%D0%B9_%D0%BF%D0%B5%D1%89%D0%B5%D1%80%D0%B5.jpg"
        }
      ],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://en.wikipedia.org/wiki/Shulgan-Tash_Cave",
          label: "en.wikipedia.org"
        }
      ],
      report: "wow-candidates"
    },
    {
      id: "derinkuyu",
      nameRu: "Деринкую",
      nameEn: "Derinkuyu Underground City",
      country: "Turkey",
      countryRu: "Турция",
      lat: 38.3735761,
      lon: 34.7351222,
      kind: "city",
      wow: null,
      card: "Страница музеев Министерства культуры называет глубину Деринкую около 85 м, а вентиляционную шахту — 55 м: она же была колодцем. Город открыт для посещения с 1965 года, сегодня доступна примерно десятая часть; турецкая Википедия пишет иначе: расчищены 8 ярусов, а 85 м — прогноз после полной расчистки, от нынешних 50 м.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Derinkuyu_door.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Derinkuyu_door.jpg?width=360",
          author: "TobyJ",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File:Derinkuyu_door.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Derinkuyu_chamber.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Derinkuyu_chamber.jpg?width=360",
          author: "TobyJ",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File:Derinkuyu_chamber.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Derinkuyu_large_room.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Derinkuyu_large_room.jpg?width=360",
          author: "Wmmorrow",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File:Derinkuyu_large_room.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Derinkuyu_.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Derinkuyu_.jpg?width=360",
          author: "The.Turk.46",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File:Derinkuyu_.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Derinkuyu_Underground_City_9831_Nevit_Enhancer.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Derinkuyu_Underground_City_9831_Nevit_Enhancer.jpg?width=360",
          author: "Nevit Dilmen",
          license: "CC BY-SA 3.0 and GFDL 1.2 or later",
          page: "https://commons.wikimedia.org/wiki/File:Derinkuyu_Underground_City_9831_Nevit_Enhancer.jpg"
        }
      ],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://www.openstreetmap.org/node/281777097",
          label: "openstreetmap.org"
        },
        {
          url: "https://muze.gov.tr/muze-detay?DistId=DKY&SectionId=DKY01",
          label: "muze.gov.tr"
        },
        {
          url: "https://www.kulturportali.gov.tr/turkiye/nevsehir/gezilecekyer/derinkuyu-yeralti-sehri",
          label: "kulturportali.gov.tr"
        },
        {
          url: "https://tr.wikipedia.org/wiki/Derinkuyu_Yeraltı_Şehri",
          label: "tr.wikipedia.org"
        }
      ],
      report: "cappadocia"
    },
    {
      id: "kaymakli",
      nameRu: "Каймаклы",
      nameEn: "Kaymaklı Underground City",
      country: "Turkey",
      countryRu: "Турция",
      lat: 38.4599265,
      lon: 34.7524882,
      kind: "city",
      wow: null,
      card: "Музейная страница министерства описывает четыре вскрытых яруса Каймаклы: конюшни, церковь с одним нефом и двумя апсидами и андезитовый блок с 57 отверстиями. Портал того же министерства пишет о восьми ярусах — первый называет хеттским — и о том, что для визита с 1964 года открыты четыре.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Kaymakl%C4%B1_Underground_City_large_room.JPG?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Kaymakl%C4%B1_Underground_City_large_room.JPG?width=360",
          author: "MusikAnimal",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File:Kaymaklı_Underground_City_large_room.JPG"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/20180109_KaymakliUnderground_3480_(39921821811).jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/20180109_KaymakliUnderground_3480_(39921821811).jpg?width=360",
          author: "Ray Swi-hymn",
          license: "CC BY-SA 2.0",
          page: "https://commons.wikimedia.org/wiki/File:20180109_KaymakliUnderground_3480_(39921821811).jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/20180109_KaymakliUnderground_3510_(28141679259).jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/20180109_KaymakliUnderground_3510_(28141679259).jpg?width=360",
          author: "Ray Swi-hymn",
          license: "CC BY-SA 2.0",
          page: "https://commons.wikimedia.org/wiki/File:20180109_KaymakliUnderground_3510_(28141679259).jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/20180109_KaymakliUnderground_3532_(39889158812).jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/20180109_KaymakliUnderground_3532_(39889158812).jpg?width=360",
          author: "Ray Swi-hymn",
          license: "CC BY-SA 2.0",
          page: "https://commons.wikimedia.org/wiki/File:20180109_KaymakliUnderground_3532_(39889158812).jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Kaymakli_underground_city_8870_Nevit_Compressor.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Kaymakli_underground_city_8870_Nevit_Compressor.jpg?width=360",
          author: "Nevit Dilmen",
          license: "CC BY-SA 3.0 and GFDL",
          page: "https://commons.wikimedia.org/wiki/File:Kaymakli_underground_city_8870_Nevit_Compressor.jpg"
        }
      ],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://www.openstreetmap.org/node/27151654",
          label: "openstreetmap.org"
        },
        {
          url: "https://muze.gov.tr/muze-detay?SectionId=KYY01&DistId=KYY",
          label: "muze.gov.tr"
        },
        {
          url: "https://www.kulturportali.gov.tr/turkiye/nevsehir/gezilecekyer/kaymakli-yeralti-sehri",
          label: "kulturportali.gov.tr"
        },
        {
          url: "https://tr.wikipedia.org/wiki/Kaymaklı_Yeraltı_Şehri",
          label: "tr.wikipedia.org"
        }
      ],
      report: "cappadocia"
    },
    {
      id: "ozkonak",
      nameRu: "Озконак",
      nameEn: "Özkonak Underground City",
      country: "Turkey",
      countryRu: "Турция",
      lat: 38.8068654,
      lon: 34.8407311,
      kind: "city",
      wow: null,
      card: "Озконак, в 14 км от Аваноса на северном склоне горы Идиш, связан не так, как Каймаклы и Деринкую: между ярусами отверстия около 5 см, и через них же шла вентиляция, когда входы комнат закрывали. Музеи министерства открывают его каждый день; глубины и числа ярусов эта страница не даёт.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Entrance_of_%C3%96zkonak_Underground_City.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Entrance_of_%C3%96zkonak_Underground_City.jpg?width=360",
          author: "Bernard Gagnon",
          license: "CC BY-SA 3.0 and GFDL 1.2 or later",
          page: "https://commons.wikimedia.org/wiki/File:Entrance_of_Özkonak_Underground_City.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/%C3%96zkonak_Underground_City.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/%C3%96zkonak_Underground_City.jpg?width=360",
          author: "Bernard Gagnon",
          license: "CC BY-SA 3.0 and GFDL 1.2 or later",
          page: "https://commons.wikimedia.org/wiki/File:Özkonak_Underground_City.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/%C3%96zkonak_-_Untergrundstadt_1.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/%C3%96zkonak_-_Untergrundstadt_1.jpg?width=360",
          author: "Wolfgang Sauber",
          license: "CC BY-SA 3.0 and GFDL 1.2 or later",
          page: "https://commons.wikimedia.org/wiki/File:Özkonak_-_Untergrundstadt_1.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Ciudad_subterr%C3%A1nea_de_%C3%96zkonak%2C_Capadocia%2C_Turqu%C3%ADa%2C_2024-10-01%2C_DD_35.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Ciudad_subterr%C3%A1nea_de_%C3%96zkonak%2C_Capadocia%2C_Turqu%C3%ADa%2C_2024-10-01%2C_DD_35.jpg?width=360",
          author: "Diego Delso",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File:Ciudad_subterránea_de_Özkonak,_Capadocia,_Turquía,_2024-10-01,_DD_35.jpg"
        }
      ],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://www.openstreetmap.org/node/1628116735",
          label: "openstreetmap.org"
        },
        {
          url: "https://muze.gov.tr/muze-detay?sectionId=OZK01&distId=OZK",
          label: "muze.gov.tr"
        },
        {
          url: "https://www.kulturportali.gov.tr/turkiye/nevsehir/gezilecekyer/ozkonak-yeralti-sehri",
          label: "kulturportali.gov.tr"
        },
        {
          url: "https://www.nevsehir.gov.tr/ozkonak-yeralti-sehri",
          label: "nevsehir.gov.tr"
        }
      ],
      report: "cappadocia"
    },
    {
      id: "mazi",
      nameRu: "Мазы",
      nameEn: "Mazı Underground City",
      country: "Turkey",
      countryRu: "Турция",
      lat: 38.4699909,
      lon: 34.8389111,
      kind: "city",
      wow: null,
      card: "Портал Министерства культуры называет древнее имя Мазы — Матаза: это 18 км к югу от Ургюпа и 10 км к востоку от Каймаклы, с четырьмя входами и церковью за короткой галереей. Ярусов, как там написано, думают четыре, пройти можно два; из-за обвалов город закрывали в 2003 году и снова открыли в 2015.",
      photos: [],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://www.openstreetmap.org/node/1143445897",
          label: "openstreetmap.org"
        },
        {
          url: "https://www.kulturportali.gov.tr/turkiye/nevsehir/gezilecekyer/mazi-yeralti-sehri",
          label: "kulturportali.gov.tr"
        },
        {
          url: "https://tr.wikipedia.org/wiki/Ürgüp",
          label: "tr.wikipedia.org"
        }
      ],
      report: "cappadocia"
    },
    {
      id: "tatlarin",
      nameRu: "Татларин",
      nameEn: "Tatlarin Underground City",
      country: "Turkey",
      countryRu: "Турция",
      lat: 38.6370357,
      lon: 34.4822337,
      kind: "city",
      wow: null,
      card: "Отдельной страницы министерства с цифрами по Татларину в этой выборке нет. На OpenStreetMap есть вход с именем Tatlarin Yeraltı Şehri, а список турецкой Википедии относит его к подземным городам Невшехира, открытым для туризма, без глубины и числа ярусов.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Tatlarin_01.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Tatlarin_01.jpg?width=360",
          author: "Katpatuka",
          license: "public domain (Commons PD-user)",
          page: "https://commons.wikimedia.org/wiki/File:Tatlarin_01.jpg"
        }
      ],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://www.openstreetmap.org/node/13114159767",
          label: "openstreetmap.org"
        },
        {
          url: "https://tr.wikipedia.org/wiki/Kapadokya%27daki_yeraltı_şehirleri_listesi",
          label: "tr.wikipedia.org"
        }
      ],
      report: "cappadocia"
    },
    {
      id: "gaziemir",
      nameRu: "Газиемир",
      nameEn: "Gaziemir Underground City",
      country: "Turkey",
      countryRu: "Турция",
      lat: 38.3520724,
      lon: 34.3889351,
      kind: "city",
      wow: null,
      card: "Управление культуры Аксарая описывает Газиемир как подземный город иного плана: вход по каменному коридору к площади с комнатами вокруг, две церкви, винодельня и ниши в длинных коридорах, чтобы лежать, как в караван-сарае. Глубины и вместимости на этой странице нет.",
      photos: [],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://www.openstreetmap.org/node/3090482561",
          label: "openstreetmap.org"
        },
        {
          url: "https://aksaray.ktb.gov.tr/TR-63663/yeralti-sehirleri.html",
          label: "aksaray.ktb.gov.tr"
        }
      ],
      report: "cappadocia"
    },
    {
      id: "saratli-kirkgöz",
      nameRu: "Саратлы Кыркгёз",
      nameEn: "Saratlı Kırkgöz Underground City",
      country: "Turkey",
      countryRu: "Турция",
      lat: 38.4505898,
      lon: 34.2350274,
      kind: "city",
      wow: null,
      card: "Управление культуры Аксарая пишет, что в Саратлы Кыркгёз в 2001 году расчистили и открыли три яруса, а всего их предполагают семь: сорок комнат и своя вентиляция. На втором ярусе колодец глубиной 10 м — это глубина колодца, не всего города.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Saratli_260DSC_0313_(47810055451).jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Saratli_260DSC_0313_(47810055451).jpg?width=360",
          author: "János Korom Dr.",
          license: "CC BY-SA 2.0",
          page: "https://commons.wikimedia.org/wiki/File:Saratli_260DSC_0313_(47810055451).jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Saratli_260DSC_0320_(47757967232).jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Saratli_260DSC_0320_(47757967232).jpg?width=360",
          author: "János Korom Dr.",
          license: "CC BY-SA 2.0",
          page: "https://commons.wikimedia.org/wiki/File:Saratli_260DSC_0320_(47757967232).jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Saratli_260IMG_20190314_161614_(40843649613).jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Saratli_260IMG_20190314_161614_(40843649613).jpg?width=360",
          author: "János Korom Dr.",
          license: "CC BY-SA 2.0",
          page: "https://commons.wikimedia.org/wiki/File:Saratli_260IMG_20190314_161614_(40843649613).jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Saratli_260IMG_20190314_162435_(47020667484).jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Saratli_260IMG_20190314_162435_(47020667484).jpg?width=360",
          author: "János Korom Dr.",
          license: "CC BY-SA 2.0",
          page: "https://commons.wikimedia.org/wiki/File:Saratli_260IMG_20190314_162435_(47020667484).jpg"
        }
      ],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://www.openstreetmap.org/node/201411412",
          label: "openstreetmap.org"
        },
        {
          url: "https://aksaray.ktb.gov.tr/TR-63663/yeralti-sehirleri.html",
          label: "aksaray.ktb.gov.tr"
        }
      ],
      report: "cappadocia"
    },
    {
      id: "ozluce",
      nameRu: "Озлюдже",
      nameEn: "Özlüce Underground City",
      country: "Turkey",
      countryRu: "Турция",
      lat: 38.4538093,
      lon: 34.6797625,
      kind: "city",
      wow: null,
      card: "На OpenStreetMap у Деринкую отмечен вход с именем Özlüce yeraltı şehri. Турецкая Википедия включает Озлюдже в список подземных городов Невшехира, открытых для туризма; глубины и числа ярусов в прочитанных страницах министерства нет.",
      photos: [],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://www.openstreetmap.org/node/1140623190",
          label: "openstreetmap.org"
        }
      ],
      report: "cappadocia"
    },
    {
      id: "naours",
      nameRu: "Подземный город Наур",
      nameEn: "Grottes de Naours (Cité souterraine de Naours)",
      country: "France",
      countryRu: "Франция",
      lat: 50.03611111,
      lon: 2.2775,
      kind: "city",
      wow: null,
      card: "Под холмом в Науре — убежище из 28 галерей и около 130 комнат, в среднем на глубине 33 метра; ходы высотой 1,6–2 метра, круглый год 9,5 °C. Кюре Эрнест Даникур снова открыл вход 15 декабря 1887 года, и кроме Второй мировой сюда с тех пор пускают посетителей.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Grottes_de_Naours001.JPG?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Grottes_de_Naours001.JPG?width=360",
          author: "Raphodon",
          license: "CC BY-SA 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3AGrottes_de_Naours001.JPG"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Grottes_de_Naours075.JPG?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Grottes_de_Naours075.JPG?width=360",
          author: "Raphodon",
          license: "CC BY-SA 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3AGrottes_de_Naours075.JPG"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Naours_Ville_souterraine_01.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Naours_Ville_souterraine_01.jpg?width=360",
          author: "Zairon",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3ANaours_Ville_souterraine_01.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Naours_Ville_souterraine_05.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Naours_Ville_souterraine_05.jpg?width=360",
          author: "Zairon",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3ANaours_Ville_souterraine_05.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Naours_Ville_souterraine_08.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Naours_Ville_souterraine_08.jpg?width=360",
          author: "Zairon",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3ANaours_Ville_souterraine_08.jpg"
        }
      ],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://www.wikidata.org/wiki/Q2974832",
          label: "wikidata.org"
        },
        {
          url: "https://fr.wikipedia.org/wiki/Cit%C3%A9_souterraine_de_Naours",
          label: "fr.wikipedia.org"
        },
        {
          url: "https://sketchfab.com/3d-models/graffitis-de-la-grande-guerre-a8f5e23d344e482caae03e0f8aa15964",
          label: "sketchfab.com"
        }
      ],
      report: "europe"
    },
    {
      id: "wieliczka",
      nameRu: "Соляная шахта в Величке",
      nameEn: "Wieliczka Salt Mine",
      country: "Poland",
      countryRu: "Польша",
      lat: 49.9830482,
      lon: 20.0557077,
      kind: "mine",
      wow: null,
      card: "Девять уровней, нижний на глубине 327 метров, ходы около 245 км по сайту шахты — и для гостей открыты только 2% переходов, только с проводником. Английская Википедия даёт ту же глубину, но длину больше 287 км.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/01332Wieliczka.JPG?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/01332Wieliczka.JPG?width=360",
          author: "Rj1979",
          license: "Public domain",
          page: "https://commons.wikimedia.org/wiki/File%3A01332Wieliczka.JPG"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/01348Wieliczka.JPG?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/01348Wieliczka.JPG?width=360",
          author: "Rj1979",
          license: "Public domain",
          page: "https://commons.wikimedia.org/wiki/File%3A01348Wieliczka.JPG"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/01360Wieliczka.JPG?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/01360Wieliczka.JPG?width=360",
          author: "Rj1979",
          license: "Public domain",
          page: "https://commons.wikimedia.org/wiki/File%3A01360Wieliczka.JPG"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/00520_Wieliczka%2C_kopalnia_soli%2C_XIII.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/00520_Wieliczka%2C_kopalnia_soli%2C_XIII.jpg?width=360",
          author: "Daniel.zolopa",
          license: "CC BY-SA 3.0 pl",
          page: "https://commons.wikimedia.org/wiki/File%3A00520_Wieliczka%2C_kopalnia_soli%2C_XIII.jpg"
        }
      ],
      models: [
        {
          title: "",
          embed: "https://sketchfab.com/models/8224ff719c34483e9effed9aa0d8590e/embed",
          page: "https://sketchfab.com/3d-models/horn-of-salt-diggers-brotherhood-of-wieliczka-8224ff719c34483e9effed9aa0d8590e",
          author: "WirtualneMuzeaMalopolski",
          license: "CC0"
        },
        {
          title: "",
          embed: "https://sketchfab.com/models/59cace95b21041d0bf45dff3347df4fb/embed",
          page: "https://sketchfab.com/3d-models/wieliczka-door-59cace95b21041d0bf45dff3347df4fb",
          author: "zhenkoest",
          license: "CC BY"
        }
      ],
      tours: [
        {
          url: "https://api.kopalnia.pl/panoramy/Wieliczka_PL/Wieliczka.html",
          provider: "Kopalnia Soli Wieliczka. krpano page titled Wieliczka - Wirtualny Spacer, linked from the official site for the Chapel of St Kinga and the Chapel of St Anthony.",
          embeddable: false
        },
        {
          url: "https://www.youtube.com/playlist?list=PLxBBt5wRZ_PPtchWAxDyda_p3zskf2JQj",
          provider: "Kopalnia Soli Wieliczka on YouTube. Video tour, not a 360 panorama.",
          embeddable: true
        }
      ],
      sources: [
        {
          url: "https://www.wikidata.org/wiki/Q454019",
          label: "wikidata.org"
        },
        {
          url: "https://www.kopalnia.pl/turysta-indywidualny/o-kopalni/niekonczace-sie-korytarze",
          label: "kopalnia.pl"
        },
        {
          url: "https://en.wikipedia.org/wiki/Wieliczka_Salt_Mine",
          label: "en.wikipedia.org"
        },
        {
          url: "https://www.kopalnia.pl/turysta-indywidualny/o-kopalni/historia-kopalni",
          label: "kopalnia.pl"
        },
        {
          url: "https://web.archive.org/web/20231219082409/https://whc.unesco.org/en/list/32/",
          label: "web.archive.org"
        }
      ],
      report: "europe"
    },
    {
      id: "orvieto-underground",
      nameRu: "Подземелья Орвието",
      nameEn: "Orvieto Underground (Sotterranei di Orvieto)",
      country: "Italy",
      countryRu: "Италия",
      lat: 42.716587,
      lon: 12.11298,
      kind: "city",
      wow: null,
      card: "Под Орвието спелеологи с конца 1970-х насчитали больше 1200 рукотворных полостей; экскурсия уходит каждый день с площади Дуомо, 23. Оператор говорит о рытье примерно 2500 лет и об одном ходе глубже 35 метров — общей глубины всей сети в источниках нет.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Cunicolo.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Cunicolo.jpg?width=360",
          author: "D.benedetti",
          license: "Public domain",
          page: "https://commons.wikimedia.org/wiki/File%3ACunicolo.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Italia-Orvieto-Citta_sotterranea-02E.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Italia-Orvieto-Citta_sotterranea-02E.jpg?width=360",
          author: "Rikki Mitterer",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3AItalia-Orvieto-Citta_sotterranea-02E.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Italia-Orvieto-Citta_sotterranea-05E.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Italia-Orvieto-Citta_sotterranea-05E.jpg?width=360",
          author: "Rikki Mitterer",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3AItalia-Orvieto-Citta_sotterranea-05E.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Italia-Orvieto-Citta_sotterranea-10E.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Italia-Orvieto-Citta_sotterranea-10E.jpg?width=360",
          author: "Rikki Mitterer",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3AItalia-Orvieto-Citta_sotterranea-10E.jpg"
        }
      ],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://it.wikipedia.org/wiki/Sotterranei_di_Orvieto",
          label: "it.wikipedia.org"
        },
        {
          url: "https://orvietounderground.it/en/home/",
          label: "orvietounderground.it"
        },
        {
          url: "https://orvietounderground.it/en/the-discovery/",
          label: "orvietounderground.it"
        }
      ],
      report: "europe"
    },
    {
      id: "matera-sassi",
      nameRu: "Сасси ди Матера",
      nameEn: "Sassi di Matera",
      country: "Italy",
      countryRu: "Италия",
      lat: 40.6660561,
      lon: 16.6115607,
      kind: "dwellings",
      wow: null,
      card: "Сассо Кавеозо и Сассо Баризано — дома, вырезанные в местном калкарените; вместе с парком скальных церквей они в списке ЮНЕСКО с 1993 года. В 1950-х государство принудительно переселило отсюда большую часть жителей. Сколько здесь пещер и на какую глубину, проверенные источники не говорят.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/%22_12_-_ITALY_-_Sassi_di_Matera_UNESCO.JPG?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/%22_12_-_ITALY_-_Sassi_di_Matera_UNESCO.JPG?width=360",
          author: "Pava",
          license: "CC BY-SA 3.0 it",
          page: "https://commons.wikimedia.org/wiki/File%3A%22_12_-_ITALY_-_Sassi_di_Matera_UNESCO.JPG"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/%221993_wurden_die_Sassi_di_Matera_als_einzigartiges_Zeugnis_der_Grottenkultur_von_der_UNESCO_zum_Weltkulturerbe_erkl%C3%A4rt%22._01.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/%221993_wurden_die_Sassi_di_Matera_als_einzigartiges_Zeugnis_der_Grottenkultur_von_der_UNESCO_zum_Weltkulturerbe_erkl%C3%A4rt%22._01.jpg?width=360",
          author: "Holger Uwe Schmitt",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3A%221993_wurden_die_Sassi_di_Matera_als_einzigartiges_Zeugnis_der_Grottenkultur_von_der_UNESCO_zum_Weltkulturerbe_erkl%C3%A4rt%22._01.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/%221993_wurden_die_Sassi_di_Matera_als_einzigartiges_Zeugnis_der_Grottenkultur_von_der_UNESCO_zum_Weltkulturerbe_erkl%C3%A4rt%22._05.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/%221993_wurden_die_Sassi_di_Matera_als_einzigartiges_Zeugnis_der_Grottenkultur_von_der_UNESCO_zum_Weltkulturerbe_erkl%C3%A4rt%22._05.jpg?width=360",
          author: "Holger Uwe Schmitt",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3A%221993_wurden_die_Sassi_di_Matera_als_einzigartiges_Zeugnis_der_Grottenkultur_von_der_UNESCO_zum_Weltkulturerbe_erkl%C3%A4rt%22._05.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/%221993_wurden_die_Sassi_di_Matera_als_einzigartiges_Zeugnis_der_Grottenkultur_von_der_UNESCO_zum_Weltkulturerbe_erkl%C3%A4rt%22._12.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/%221993_wurden_die_Sassi_di_Matera_als_einzigartiges_Zeugnis_der_Grottenkultur_von_der_UNESCO_zum_Weltkulturerbe_erkl%C3%A4rt%22._12.jpg?width=360",
          author: "Holger Uwe Schmitt",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3A%221993_wurden_die_Sassi_di_Matera_als_einzigartiges_Zeugnis_der_Grottenkultur_von_der_UNESCO_zum_Weltkulturerbe_erkl%C3%A4rt%22._12.jpg"
        }
      ],
      models: [
        {
          title: "",
          embed: "https://sketchfab.com/models/695ee0722c2b437694581194b3b3d6a8/embed",
          page: "https://sketchfab.com/3d-models/matera-sassi-cave-museum-695ee0722c2b437694581194b3b3d6a8",
          author: "sitescape",
          license: "CC BY"
        },
        {
          title: "",
          embed: "https://sketchfab.com/models/c5ea8441fc2445a481bb4198f83273cc/embed",
          page: "https://sketchfab.com/3d-models/italy-matera-sassi-cave-houses-c5ea8441fc2445a481bb4198f83273cc",
          author: "zhenkoest",
          license: "CC BY"
        }
      ],
      tours: [],
      sources: [
        {
          url: "https://www.wikidata.org/wiki/Q2350404",
          label: "wikidata.org"
        },
        {
          url: "https://en.wikipedia.org/wiki/Sassi_di_Matera",
          label: "en.wikipedia.org"
        }
      ],
      report: "europe"
    },
    {
      id: "setenil",
      nameRu: "Сетениль-де-лас-Бодегас",
      nameEn: "Setenil de las Bodegas",
      country: "Spain",
      countryRu: "Испания",
      lat: 36.864166666667,
      lon: -5.1813888888889,
      kind: "dwellings",
      wow: null,
      card: "В Сетениле дома встроены в скальный козырёк над рекой Гуадальпоркун. Замок стоит как минимум с альмохадского XII века, а город взяли в 1484 году после пятнадцати дней осады. Глубины в метрах нет: это не шахта, а улицы под навесом скалы.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Setenil_de_las_Bodegas_(2024)_-_Cueva_de_Mar%C3%ADa_Tormento.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Setenil_de_las_Bodegas_(2024)_-_Cueva_de_Mar%C3%ADa_Tormento.jpg?width=360",
          author: "Makoki20",
          license: "CC0",
          page: "https://commons.wikimedia.org/wiki/File%3ASetenil_de_las_Bodegas_%282024%29_-_Cueva_de_Mar%C3%ADa_Tormento.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Setenil_de_las_Bodegas_(2024).jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Setenil_de_las_Bodegas_(2024).jpg?width=360",
          author: "Makoki20",
          license: "CC0",
          page: "https://commons.wikimedia.org/wiki/File%3ASetenil_de_las_Bodegas_%282024%29.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/MaSetenil01.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/MaSetenil01.jpg?width=360",
          author: "Ziegler175",
          license: "CC BY-SA 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3AMaSetenil01.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Setenil_de_las_Bodegas_-_001_(30708392785).jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Setenil_de_las_Bodegas_-_001_(30708392785).jpg?width=360",
          author: "Luis Rogelio HM",
          license: "CC BY-SA 2.0",
          page: "https://commons.wikimedia.org/wiki/File%3ASetenil_de_las_Bodegas_-_001_%2830708392785%29.jpg"
        }
      ],
      models: [
        {
          title: "",
          embed: "https://sketchfab.com/models/e3da98c219f845cc84526ae6d47046e2/embed",
          page: "https://sketchfab.com/3d-models/setenil-e3da98c219f845cc84526ae6d47046e2",
          author: "leomaldonadoh",
          license: "CC BY"
        }
      ],
      tours: [],
      sources: [
        {
          url: "https://www.wikidata.org/wiki/Q918623",
          label: "wikidata.org"
        },
        {
          url: "https://en.wikipedia.org/wiki/Setenil_de_las_Bodegas",
          label: "en.wikipedia.org"
        },
        {
          url: "https://sketchfab.com/3d-models/setenil-e3da98c219f845cc84526ae6d47046e2",
          label: "sketchfab.com"
        }
      ],
      report: "europe"
    },
    {
      id: "mary-kings-close",
      nameRu: "Клоуз Мэри Кинг",
      nameEn: "Real Mary King's Close",
      country: "United Kingdom",
      countryRu: "Великобритания",
      lat: 55.9499608,
      lon: -3.1904456,
      kind: "city",
      wow: null,
      card: "Клоуз Мэри Кинг — улица XVII века под Сити-Чемберс на Королевской миле: её частично снесли и засыпали, когда в 1753 году строили Королевскую биржу. Последний житель ушёл в 1902 году, сейчас здесь экскурсии Continuum Attractions. Глубины в метрах источники не дают.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Mary_King's_Close_(Mario_RM)_-_Flickr.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Mary_King's_Close_(Mario_RM)_-_Flickr.jpg?width=360",
          author: "Mario RM from Madrid, Spain",
          license: "CC BY-SA 2.0",
          page: "https://commons.wikimedia.org/wiki/File%3AMary_King%27s_Close_%28Mario_RM%29_-_Flickr.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Mary_King's_Close_tour_(under_Edinburgh)..._(Blake_Patterson)_-_Flickr.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Mary_King's_Close_tour_(under_Edinburgh)..._(Blake_Patterson)_-_Flickr.jpg?width=360",
          author: "Blake Patterson from Alexandria, VA, USA",
          license: "CC BY 2.0",
          page: "https://commons.wikimedia.org/wiki/File%3AMary_King%27s_Close_tour_%28under_Edinburgh%29..._%28Blake_Patterson%29_-_Flickr.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Marykingsclose006.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Marykingsclose006.jpg?width=360",
          author: "The Real Mary King's Close at en.wikipedia",
          license: "Public domain",
          page: "https://commons.wikimedia.org/wiki/File%3AMarykingsclose006.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Dr_George_Rae.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Dr_George_Rae.jpg?width=360",
          author: "The Real Mary King's Close at English Wikipedia",
          license: "Public domain",
          page: "https://commons.wikimedia.org/wiki/File%3ADr_George_Rae.jpg"
        }
      ],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://nominatim.openstreetmap.org/search?q=2%20Warriston%27s%20Close%2C%20Edinburgh&format=json",
          label: "nominatim.openstreetmap.org"
        },
        {
          url: "https://en.wikipedia.org/wiki/Mary_King%27s_Close",
          label: "en.wikipedia.org"
        },
        {
          url: "https://www.realmarykingsclose.com/",
          label: "realmarykingsclose.com"
        }
      ],
      report: "europe"
    },
    {
      id: "edinburgh-vaults",
      nameRu: "Своды Саут-Бридж",
      nameEn: "Edinburgh Vaults (South Bridge Vaults)",
      country: "United Kingdom",
      countryRu: "Великобритания",
      lat: 55.94944444,
      lon: -3.18722222,
      kind: "city",
      wow: null,
      card: "Девятнадцать арок Саут-Бридж, достроенного в 1788 году, скрывают около 120 комнат — от двух до сорока квадратных метров. Что здесь жили люди, стало ясно только в 1985-м, когда в мусорных ямах нашли игрушки, пузырьки и тарелки.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Edinburgh_valuts_1.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Edinburgh_valuts_1.jpg?width=360",
          author: "Kjetil Bjørnsrud",
          license: "CC BY 2.5",
          page: "https://commons.wikimedia.org/wiki/File%3AEdinburgh_valuts_1.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Edinburgh_valuts_2.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Edinburgh_valuts_2.jpg?width=360",
          author: "Kjetil Bjørnsrud",
          license: "CC BY 2.5",
          page: "https://commons.wikimedia.org/wiki/File%3AEdinburgh_valuts_2.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Ghost_Hunter_Tour_01_(1232263404).jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Ghost_Hunter_Tour_01_(1232263404).jpg?width=360",
          author: "Shadowgate from Novara, ITALY",
          license: "CC BY 2.0",
          page: "https://commons.wikimedia.org/wiki/File%3AGhost_Hunter_Tour_01_%281232263404%29.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Ghost_Hunter_Tour_03_(1232265752).jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Ghost_Hunter_Tour_03_(1232265752).jpg?width=360",
          author: "Shadowgate from Novara, ITALY",
          license: "CC BY 2.0",
          page: "https://commons.wikimedia.org/wiki/File%3AGhost_Hunter_Tour_03_%281232265752%29.jpg"
        }
      ],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://en.wikipedia.org/wiki/Edinburgh_Vaults",
          label: "en.wikipedia.org"
        }
      ],
      report: "europe"
    },
    {
      id: "bochnia",
      nameRu: "Соляная шахта в Бохне",
      nameEn: "Bochnia Salt Mine",
      country: "Poland",
      countryRu: "Польша",
      lat: 49.9691317,
      lon: 20.4172114,
      kind: "mine",
      wow: null,
      card: "Бохня — старейшая соляная шахта Польши: предприятие с 1248 года, в списке ЮНЕСКО с 2013-го, сейчас около 190 тысяч гостей в год. По английской Википедии выработки идут на 16 уровней, примерно на 330–468 метров, а камера Важин — 255 метров в длину на глубине 248 метров.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bochnia_kopalnia_lipiec_2012_02.JPG?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Bochnia_kopalnia_lipiec_2012_02.JPG?width=360",
          author: "myself ( User:Piotrus )",
          license: "CC BY-SA 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3ABochnia_kopalnia_lipiec_2012_02.JPG"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bochnia_kopalnia_lipiec_2012_15.JPG?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Bochnia_kopalnia_lipiec_2012_15.JPG?width=360",
          author: "myself ( User:Piotrus )",
          license: "CC BY-SA 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3ABochnia_kopalnia_lipiec_2012_15.JPG"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bochnia_kopalnia_lipiec_2012_36.JPG?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Bochnia_kopalnia_lipiec_2012_36.JPG?width=360",
          author: "myself ( User:Piotrus )",
          license: "CC BY-SA 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3ABochnia_kopalnia_lipiec_2012_36.JPG"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bochnia_kopalnia_16.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Bochnia_kopalnia_16.jpg?width=360",
          author: "Andrzej Otrębski",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3ABochnia_kopalnia_16.jpg"
        }
      ],
      models: [
        {
          title: "",
          embed: "https://sketchfab.com/models/01f6f66f379545dba5f1e05a428a467c/embed",
          page: "https://sketchfab.com/3d-models/salt-block-01f6f66f379545dba5f1e05a428a467c",
          author: "WirtualneMuzeaMalopolski",
          license: "CC0"
        }
      ],
      tours: [],
      sources: [
        {
          url: "https://kopalnia-bochnia.pl/en/o-kopalni/historia/",
          label: "kopalnia-bochnia.pl"
        },
        {
          url: "https://en.wikipedia.org/wiki/Bochnia_Salt_Mine",
          label: "en.wikipedia.org"
        },
        {
          url: "https://sketchfab.com/3d-models/salt-block-01f6f66f379545dba5f1e05a428a467c",
          label: "sketchfab.com"
        }
      ],
      report: "europe"
    },
    {
      id: "guadix",
      nameRu: "Пещерные дома Гуадикса",
      nameEn: "Cave houses of Guadix (Casas-cueva, Barrio de Santiago)",
      country: "Spain",
      countryRu: "Испания",
      lat: 37.300555555556,
      lon: -3.135,
      kind: "dwellings",
      wow: null,
      card: "Гуадикс стоит на высоте 913 метров, а в квартале Сантьяго дома вырезаны в скале. Сколько таких домов, на какую глубину и когда их начали рыть, в проверенных источниках не сказано — отдельной точки квартала на карте тоже не нашлось.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/CasaCuevaGuadix2015.JPG?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/CasaCuevaGuadix2015.JPG?width=360",
          author: "AntonVe",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3ACasaCuevaGuadix2015.JPG"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Cuevas_De_Guadix_(166031275).jpeg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Cuevas_De_Guadix_(166031275).jpeg?width=360",
          author: "Rubens Vallejos",
          license: "CC BY-SA 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3ACuevas_De_Guadix_%28166031275%29.jpeg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/ES_Guadix_1106_(100)_(17245822355).jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/ES_Guadix_1106_(100)_(17245822355).jpg?width=360",
          author: "Diego Tirira from Quito, Ecuador",
          license: "CC BY-SA 2.0",
          page: "https://commons.wikimedia.org/wiki/File%3AES_Guadix_1106_%28100%29_%2817245822355%29.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/ES_Guadix_1106_(107)_(16625623833).jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/ES_Guadix_1106_(107)_(16625623833).jpg?width=360",
          author: "Diego Tirira from Quito, Ecuador",
          license: "CC BY-SA 2.0",
          page: "https://commons.wikimedia.org/wiki/File%3AES_Guadix_1106_%28107%29_%2816625623833%29.jpg"
        }
      ],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://www.wikidata.org/wiki/Q244324",
          label: "wikidata.org"
        },
        {
          url: "https://en.wikipedia.org/wiki/Guadix",
          label: "en.wikipedia.org"
        },
        {
          url: "https://es.wikipedia.org/wiki/Casa-cueva",
          label: "es.wikipedia.org"
        },
        {
          url: "https://commons.wikimedia.org/wiki/Category:Casas-cueva,_Guadix",
          label: "commons.wikimedia.org"
        }
      ],
      report: "europe"
    },
    {
      id: "budapest-labyrinth",
      nameRu: "Лабиринт Будайской крепости",
      nameEn: "Labyrinth of Buda Castle (Budavári labirintus / Várbarlang)",
      country: "Hungary",
      countryRu: "Венгрия",
      lat: 47.50016,
      lon: 19.0341,
      kind: "city",
      wow: null,
      card: "Под Будайской крепостью горячие источники вымыли полости между известковым туфом и мергелем; вместе с поздними погребами система около 3,3 км длиной и примерно 12 метров глубиной. Туристический лабиринт на улице Ури, 9, по словам оператора, открыт каждый день с 11 до 18, внутри 16–18 °C и влажность около 90%.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Budapest_Labyrinth.JPG?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Budapest_Labyrinth.JPG?width=360",
          author: "Elelicht",
          license: "CC BY-SA 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3ABudapest_Labyrinth.JPG"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Budapest%2C_Budav%C3%A1ri_labirintus.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Budapest%2C_Budav%C3%A1ri_labirintus.jpg?width=360",
          author: "Christo",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3ABudapest%2C_Budav%C3%A1ri_labirintus.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Labyrinth_of_the_Buda_Castle_01.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Labyrinth_of_the_Buda_Castle_01.jpg?width=360",
          author: "MOs810",
          license: "CC BY 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3ALabyrinth_of_the_Buda_Castle_01.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Buda_Castle_Labyrinth_(5477335408).jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Buda_Castle_Labyrinth_(5477335408).jpg?width=360",
          author: "Greg Dunlap from Portland, USA",
          license: "CC BY 2.0",
          page: "https://commons.wikimedia.org/wiki/File%3ABuda_Castle_Labyrinth_%285477335408%29.jpg"
        }
      ],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://hu.wikipedia.org/wiki/Budav%C3%A1ri_labirintus",
          label: "hu.wikipedia.org"
        },
        {
          url: "https://labirintus.eu/informacio/",
          label: "labirintus.eu"
        },
        {
          url: "https://labirintus.eu/en/",
          label: "labirintus.eu"
        }
      ],
      report: "europe"
    },
    {
      id: "coober-pedy",
      nameRu: "Кубер-Педи",
      nameEn: "Coober Pedy",
      country: "Australia",
      countryRu: "Австралия",
      lat: -29.011111,
      lon: 134.755556,
      kind: "dwellings",
      wow: null,
      card: "В Кубер-Педи, в 846 км к северу от Аделаиды, многие живут в «дагоутах» — комнатах, вырезанных в холме, потому что на поверхности летом часто выше 40 °C. Перепись 2021 года насчитала в посёлке 1566 человек; сколько из них под землёй, источник не говорит.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Coober_Pedy_Australia.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Coober_Pedy_Australia.jpg?width=360",
          author: "Thomas Schoch",
          license: "CC BY-SA 2.5",
          page: "https://commons.wikimedia.org/wiki/File%3ACoober_Pedy_Australia.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Coober_Pedy_Mines_Australia.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Coober_Pedy_Mines_Australia.jpg?width=360",
          author: "Thomas Schoch",
          license: "CC BY-SA 2.5",
          page: "https://commons.wikimedia.org/wiki/File%3ACoober_Pedy_Mines_Australia.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Serbian_Orthodox_Church_in_Coober_Pedy.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Serbian_Orthodox_Church_in_Coober_Pedy.jpg?width=360",
          author: "Robert Link",
          license: "CC BY-SA 2.0",
          page: "https://commons.wikimedia.org/wiki/File%3ASerbian_Orthodox_Church_in_Coober_Pedy.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Coober_Pedy_-_The_Big_winch_lookout.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Coober_Pedy_-_The_Big_winch_lookout.jpg?width=360",
          author: "TalShiar at Dutch Wikipedia ( Original text: Tal Shiar )",
          license: "Public domain",
          page: "https://commons.wikimedia.org/wiki/File%3ACoober_Pedy_-_The_Big_winch_lookout.jpg"
        }
      ],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://en.wikipedia.org/wiki/Coober_Pedy",
          label: "en.wikipedia.org"
        },
        {
          url: "https://www.wikidata.org/wiki/Q779188",
          label: "wikidata.org"
        },
        {
          url: "https://www.abs.gov.au/census/find-census-data/quickstats/2021/SAL40295",
          label: "abs.gov.au"
        },
        {
          url: "https://www.cooberpedy.sa.gov.au/",
          label: "cooberpedy.sa.gov.au"
        }
      ],
      report: "world"
    },
    {
      id: "matmata",
      nameRu: "Матмата",
      nameEn: "Matmata",
      country: "Tunisia",
      countryRu: "Тунис",
      lat: 33.542639,
      lon: 9.966806,
      kind: "dwellings",
      wow: null,
      card: "В Матмате дом начинается с ямы: по краям выкапывают комнаты, а несколько ям соединяют траншеями. В 2004 году Википедия даёт 2116 жителей, и после обрушений 1969 года большинство так и осталось под землёй.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Matmata_Pit_Dwelling_(40539595531).jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Matmata_Pit_Dwelling_(40539595531).jpg?width=360",
          author: "David Stanley from Nanaimo, Canada",
          license: "CC BY 2.0",
          page: "https://commons.wikimedia.org/wiki/File%3AMatmata_Pit_Dwelling_%2840539595531%29.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Matmata_Landscape_Houses.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Matmata_Landscape_Houses.jpg?width=360",
          author: "Tico at Romanian Wikipedia",
          license: "Public domain",
          page: "https://commons.wikimedia.org/wiki/File%3AMatmata_Landscape_Houses.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Matmata02.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Matmata02.jpg?width=360",
          author: "The original uploader was Adrian Monk at French Wikipedia .",
          license: "CC BY-SA 1.0",
          page: "https://commons.wikimedia.org/wiki/File%3AMatmata02.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Matmata.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Matmata.jpg?width=360",
          author: "Jaume Ollé",
          license: "CC BY 2.5",
          page: "https://commons.wikimedia.org/wiki/File%3AMatmata.jpg"
        }
      ],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://en.wikipedia.org/wiki/Matmata,_Tunisia",
          label: "en.wikipedia.org"
        },
        {
          url: "https://nominatim.openstreetmap.org/search?q=Matmata%2C+Tunisia&format=jsonv2",
          label: "nominatim.openstreetmap.org"
        },
        {
          url: "https://www.wikidata.org/wiki/Q338512",
          label: "wikidata.org"
        }
      ],
      report: "world"
    },
    {
      id: "guyaju",
      nameRu: "Пещеры Гуяцзюй",
      nameEn: "Guyaju Caves",
      country: "China",
      countryRu: "Китай",
      lat: 40.465556,
      lon: 115.768889,
      kind: "cave",
      wow: null,
      card: "В Яньцине в скале выдолблено от 117 до более чем 170 каменных комнат, а всего помещений больше 350, на участке 1,5 км². Кто и когда это сделал, так и не установлено, хотя гостей пускают с 1991 года.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Guyaju_ruins%2C_Yanqing_county%2C_Beijing.JPG?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Guyaju_ruins%2C_Yanqing_county%2C_Beijing.JPG?width=360",
          author: "me ( w:User:pfctdayelise )",
          license: "CC BY-SA 2.5",
          page: "https://commons.wikimedia.org/wiki/File%3AGuyaju_ruins%2C_Yanqing_county%2C_Beijing.JPG"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Ancient_Cliff_Dwellings_in_Yanqing%2C_2011-08-03_04.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Ancient_Cliff_Dwellings_in_Yanqing%2C_2011-08-03_04.jpg?width=360",
          author: "Siyuwj",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3AAncient_Cliff_Dwellings_in_Yanqing%2C_2011-08-03_04.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/%E5%BB%B6%E5%BA%86%E5%8F%A4%E5%B4%96%E5%B1%85_03.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/%E5%BB%B6%E5%BA%86%E5%8F%A4%E5%B4%96%E5%B1%85_03.jpg?width=360",
          author: "Shizhao",
          license: "CC BY-SA 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3A%E5%BB%B6%E5%BA%86%E5%8F%A4%E5%B4%96%E5%B1%85_03.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/%E5%8F%A4%E5%B4%96%E5%B1%85%E5%89%8D%E5%B1%B1_-_North_Part_of_the_Cliff_Dwelling_-_2013.06_-_panoramio.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/%E5%8F%A4%E5%B4%96%E5%B1%85%E5%89%8D%E5%B1%B1_-_North_Part_of_the_Cliff_Dwelling_-_2013.06_-_panoramio.jpg?width=360",
          author: "rheins",
          license: "CC BY 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3A%E5%8F%A4%E5%B4%96%E5%B1%85%E5%89%8D%E5%B1%B1_-_North_Part_of_the_Cliff_Dwelling_-_2013.06_-_panoramio.jpg"
        }
      ],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://en.wikipedia.org/wiki/Guyaju_Caves",
          label: "en.wikipedia.org"
        },
        {
          url: "https://www.wikidata.org/wiki/Q10913277",
          label: "wikidata.org"
        }
      ],
      report: "world"
    },
    {
      id: "yaodong",
      nameRu: "Яодуны",
      nameEn: "Yaodong cave dwellings",
      country: "China",
      countryRu: "Китай",
      lat: 36.602796,
      lon: 109.487398,
      kind: "dwellings",
      wow: null,
      card: "В начале 2000-х в Северном Китае в яодунах ещё жили от 30 до 40 миллионов человек: комнату режут в лёссовом склоне или по стенам квадратного двора-колодца. Это не один адрес, а тип жилья; точка на карте — город Яньань, который статья называет пещерным.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Snowfall_on_Yaodong%2C_Qingjian_County.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Snowfall_on_Yaodong%2C_Qingjian_County.jpg?width=360",
          author: "dayu490301",
          license: "CC BY 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3ASnowfall_on_Yaodong%2C_Qingjian_County.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/%E5%8F%A4%E8%80%81%E7%AA%91%E6%B4%9E%E5%89%8D%E7%9A%84%E6%B2%89%E6%80%9D%E8%80%85_-_panoramio.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/%E5%8F%A4%E8%80%81%E7%AA%91%E6%B4%9E%E5%89%8D%E7%9A%84%E6%B2%89%E6%80%9D%E8%80%85_-_panoramio.jpg?width=360",
          author: "dayu490301",
          license: "CC BY 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3A%E5%8F%A4%E8%80%81%E7%AA%91%E6%B4%9E%E5%89%8D%E7%9A%84%E6%B2%89%E6%80%9D%E8%80%85_-_panoramio.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Cave_houses_shanxi_1.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Cave_houses_shanxi_1.jpg?width=360",
          author: "Meier&Poehlmann",
          license: "CC BY 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3ACave_houses_shanxi_1.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Cave_houses_shanxi_3.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Cave_houses_shanxi_3.jpg?width=360",
          author: "Meier&Poehlmann",
          license: "CC BY 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3ACave_houses_shanxi_3.jpg"
        }
      ],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://nominatim.openstreetmap.org/search?q=Yan%27an%2C+Shaanxi&format=jsonv2",
          label: "nominatim.openstreetmap.org"
        },
        {
          url: "https://en.wikipedia.org/wiki/Yaodong",
          label: "en.wikipedia.org"
        },
        {
          url: "https://commons.wikimedia.org/wiki/Category:Yaodong",
          label: "commons.wikimedia.org"
        }
      ],
      report: "world"
    },
    {
      id: "kandovan",
      nameRu: "Кандован",
      nameEn: "Kandovan",
      country: "Iran",
      countryRu: "Иран",
      lat: 37.795278,
      lon: 46.248056,
      kind: "dwellings",
      wow: null,
      card: "Кандован до сих пор жилой: дома, по-местному караан, вырезаны в вулканических конусах Саханда. Перепись 2016 года насчитала в деревне 450 человек.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Habitat_troglodyte_kandovan.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Habitat_troglodyte_kandovan.jpg?width=360",
          author: "Fabienkhan",
          license: "CC BY 2.5",
          page: "https://commons.wikimedia.org/wiki/File%3AHabitat_troglodyte_kandovan.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/1StonTownHOpic.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/1StonTownHOpic.jpg?width=360",
          author: "Homayoon Vahidi",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3A1StonTownHOpic.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/-2012-Iran.Kandovan-H.Jafari%D8%AD%D8%B3%D9%86_%D8%AC%D8%B9%D9%81%D8%B1%DB%8C_-_panoramio.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/-2012-Iran.Kandovan-H.Jafari%D8%AD%D8%B3%D9%86_%D8%AC%D8%B9%D9%81%D8%B1%DB%8C_-_panoramio.jpg?width=360",
          author: "hassan jafari",
          license: "CC BY 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3A-2012-Iran.Kandovan-H.Jafari%D8%AD%D8%B3%D9%86_%D8%AC%D8%B9%D9%81%D8%B1%DB%8C_-_panoramio.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/FILE1868.JPG?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/FILE1868.JPG?width=360",
          author: "Ultra1376",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3AFILE1868.JPG"
        }
      ],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://en.wikipedia.org/wiki/Kandovan,_Osku",
          label: "en.wikipedia.org"
        },
        {
          url: "https://www.wikidata.org/wiki/Q1818028",
          label: "wikidata.org"
        }
      ],
      report: "world"
    },
    {
      id: "meymand",
      nameRu: "Мейманд",
      nameEn: "Meymand (Maymand)",
      country: "Iran",
      countryRu: "Иран",
      lat: 30.229444,
      lon: 55.375556,
      kind: "dwellings",
      wow: null,
      card: "Зимой в Мейманде живут в домах, вырезанных в мягкой породе ярусами до пяти в высоту: таких домов около 400, а зимой обитаемы около 90. Перепись 2016 года нашла в деревне 105 человек — это другой счёт, не число домов.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Maymand_village.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Maymand_village.jpg?width=360",
          author: "SM MIRHOSSEINI",
          license: "CC BY 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3AMaymand_village.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Davtalaban_meymand.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Davtalaban_meymand.jpg?width=360",
          author: "meymand",
          license: "CC BY-SA 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3ADavtalaban_meymand.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/IMAG1498.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/IMAG1498.jpg?width=360",
          author: "AshkanSaeedeh",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3AIMAG1498.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/IMAG1503.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/IMAG1503.jpg?width=360",
          author: "AshkanSaeedeh",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3AIMAG1503.jpg"
        }
      ],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://en.wikipedia.org/wiki/Meymand,_Kerman",
          label: "en.wikipedia.org"
        },
        {
          url: "https://www.wikidata.org/wiki/Q1013465",
          label: "wikidata.org"
        },
        {
          url: "https://whc.unesco.org/en/list/1423/",
          label: "whc.unesco.org"
        }
      ],
      report: "world"
    },
    {
      id: "nushabad",
      nameRu: "Подземный город Нушабада",
      nameEn: "Nushabad underground city",
      country: "Iran",
      countryRu: "Иран",
      lat: 34.080056,
      lon: 51.437472,
      kind: "city",
      wow: null,
      card: "Под Нушабадом три уровня ходов, и наверх можно подняться только снизу: так прятались от набегов. Википедия даёт глубину 4–18 м, а Викиданные — 21 м со ссылкой на статью, текст которой здесь не открылся.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Underground_City_of_Nooshabad_01.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Underground_City_of_Nooshabad_01.jpg?width=360",
          author: "Bernard Gagnon",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3AUnderground_City_of_Nooshabad_01.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Nushabad_-_Kashan_%2C_2015.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Nushabad_-_Kashan_%2C_2015.jpg?width=360",
          author: "Enzo Nicolodi",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3ANushabad_-_Kashan_%2C_2015.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Oii!_01.JPG?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Oii!_01.JPG?width=360",
          author: "Alireza Tajfar",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3AOii%21_01.JPG"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Nooshabad_Ancient_Underground_City%2C_Info_P_1_%D8%B4%D9%87%D8%B1_%D8%B2%DB%8C%D8%B1%D8%B2%D9%85%DB%8C%D9%86%DB%8C_%D9%86%D9%88%D8%B4_%D8%A2%D8%A8%D8%A7%D8%AF_-_panoramio.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Nooshabad_Ancient_Underground_City%2C_Info_P_1_%D8%B4%D9%87%D8%B1_%D8%B2%DB%8C%D8%B1%D8%B2%D9%85%DB%8C%D9%86%DB%8C_%D9%86%D9%88%D8%B4_%D8%A2%D8%A8%D8%A7%D8%AF_-_panoramio.jpg?width=360",
          author: "Mahdi Kalhor",
          license: "CC BY 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3ANooshabad_Ancient_Underground_City%2C_Info_P_1_%D8%B4%D9%87%D8%B1_%D8%B2%DB%8C%D8%B1%D8%B2%D9%85%DB%8C%D9%86%DB%8C_%D9%86%D9%88%D8%B4_%D8%A2%D8%A8%D8%A7%D8%AF_-_panoramio.jpg"
        }
      ],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://www.wikidata.org/wiki/Q5944377",
          label: "wikidata.org"
        },
        {
          url: "https://en.wikipedia.org/wiki/Nushabad",
          label: "en.wikipedia.org"
        }
      ],
      report: "world"
    },
    {
      id: "vardzia",
      nameRu: "Вардзиа",
      nameEn: "Vardzia",
      country: "Georgia",
      countryRu: "Грузия",
      lat: 41.380917,
      lon: 43.283761,
      kind: "temple",
      wow: null,
      card: "Вардзиа вырублена в обрыве на пятьсот метров и до девятнадцати ярусов, в основном во второй половине XII века. В восточной части 79 пещерных жилищ и 242 комнаты, дальше ещё 40 домов и 165 комнат.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Vardzia_(1).jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Vardzia_(1).jpg?width=360",
          author: "Tiniko Dzadzamia",
          license: "CC BY-SA 2.0",
          page: "https://commons.wikimedia.org/wiki/File%3AVardzia_%281%29.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Georgien_vardzia.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Georgien_vardzia.jpg?width=360",
          author: "Rike Fotos",
          license: "CC BY 2.0",
          page: "https://commons.wikimedia.org/wiki/File%3AGeorgien_vardzia.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Vardezia_city_cave%2C_Georgia.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Vardezia_city_cave%2C_Georgia.jpg?width=360",
          author: "ben van der ploeg from devizes, uk",
          license: "CC BY 2.0",
          page: "https://commons.wikimedia.org/wiki/File%3AVardezia_city_cave%2C_Georgia.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Vardzia_(10).jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Vardzia_(10).jpg?width=360",
          author: "DAVID HOLT from London, England",
          license: "CC BY-SA 2.0",
          page: "https://commons.wikimedia.org/wiki/File%3AVardzia_%2810%29.jpg"
        }
      ],
      models: [
        {
          title: "Vardzia",
          embed: "https://sketchfab.com/models/9319da771b474415b1ba83ffe38a8fc9/embed",
          page: "https://sketchfab.com/3d-models/vardzia-9319da771b474415b1ba83ffe38a8fc9",
          author: "spetrukhin.mail.ru",
          license: "CC BY 4.0"
        }
      ],
      tours: [],
      sources: [
        {
          url: "https://en.wikipedia.org/wiki/Vardzia",
          label: "en.wikipedia.org"
        }
      ],
      report: "world"
    },
    {
      id: "uplistsikhe",
      nameRu: "Уплисцихе",
      nameEn: "Uplistsikhe",
      country: "Georgia",
      countryRu: "Грузия",
      lat: 41.966845,
      lon: 44.207671,
      kind: "city",
      wow: null,
      card: "Уплисцихе — город, высеченный в скале на площади около 8 гектаров, в 10 км к востоку от Гори. Постройки здесь от раннего железного века до позднего Средневековья.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/2016_Uplisciche%2C_Rezerwat_historyczno-architektoniczny_(001).jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/2016_Uplisciche%2C_Rezerwat_historyczno-architektoniczny_(001).jpg?width=360",
          author: "Marcin Konsek",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3A2016_Uplisciche%2C_Rezerwat_historyczno-architektoniczny_%28001%29.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/2016_Uplisciche%2C_Rezerwat_historyczno-architektoniczny_(002).jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/2016_Uplisciche%2C_Rezerwat_historyczno-architektoniczny_(002).jpg?width=360",
          author: "Marcin Konsek",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3A2016_Uplisciche%2C_Rezerwat_historyczno-architektoniczny_%28002%29.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Uplistsikhe_view.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Uplistsikhe_view.jpg?width=360",
          author: "EvgenyGenkin",
          license: "CC BY-SA 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3AUplistsikhe_view.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Uplistsikhe_City_Caves.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Uplistsikhe_City_Caves.jpg?width=360",
          author: "applsdev",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3AUplistsikhe_City_Caves.jpg"
        }
      ],
      models: [
        {
          title: "Part of Uplistsikhe Cave Town (Raw)",
          embed: "https://sketchfab.com/models/f01aaecf00854652b6a6c24f05b40ae7/embed",
          page: "https://sketchfab.com/3d-models/part-of-uplistsikhe-cave-town-raw-f01aaecf00854652b6a6c24f05b40ae7",
          author: "nikska (Nik)",
          license: "CC BY 4.0"
        }
      ],
      tours: [],
      sources: [
        {
          url: "https://nominatim.openstreetmap.org/search?q=Uplistsikhe%2C+Georgia&format=jsonv2",
          label: "nominatim.openstreetmap.org"
        },
        {
          url: "https://en.wikipedia.org/wiki/Uplistsikhe",
          label: "en.wikipedia.org"
        },
        {
          url: "https://whc.unesco.org/en/tentativelists/5234/",
          label: "whc.unesco.org"
        },
        {
          url: "https://www.wikidata.org/wiki/Q1351318",
          label: "wikidata.org"
        }
      ],
      report: "world"
    },
    {
      id: "lalibela",
      nameRu: "Скальные церкви Лалибэлы",
      nameEn: "Rock-hewn churches of Lalibela",
      country: "Ethiopia",
      countryRu: "Эфиопия",
      lat: 12.02935,
      lon: 39.04042,
      kind: "temple",
      wow: null,
      card: "Одиннадцать церквей Лалибэлы не сложены, а вынуты из цельной скалы, с рвами между ними: ЮНЕСКО относит работу к XII веку и царю Лалибэле. Дом Спасителя мира с пятью нефами считают, возможно, самой большой монолитной церковью на свете.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Bete_Giyorgis_01.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Bete_Giyorgis_01.jpg?width=360",
          author: "Bernard Gagnon",
          license: "CC BY-SA 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3ABete_Giyorgis_01.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Courtyard_with_Stone_Bell%2C_Lalibela%2C_Ethiopia_(3301404495).jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Courtyard_with_Stone_Bell%2C_Lalibela%2C_Ethiopia_(3301404495).jpg?width=360",
          author: "A. Davey from Where I Live Now: Pacific Northwest",
          license: "CC BY 2.0",
          page: "https://commons.wikimedia.org/wiki/File%3ACourtyard_with_Stone_Bell%2C_Lalibela%2C_Ethiopia_%283301404495%29.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/The_Hermits_Door_(3272522551).jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/The_Hermits_Door_(3272522551).jpg?width=360",
          author: "A. Davey from Where I Live Now: Pacific Northwest",
          license: "CC BY 2.0",
          page: "https://commons.wikimedia.org/wiki/File%3AThe_Hermits_Door_%283272522551%29.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/The_Threshold%2C_Lalibela%2C_Ethiopia_(3298418137).jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/The_Threshold%2C_Lalibela%2C_Ethiopia_(3298418137).jpg?width=360",
          author: "A. Davey from Where I Live Now: Pacific Northwest",
          license: "CC BY 2.0",
          page: "https://commons.wikimedia.org/wiki/File%3AThe_Threshold%2C_Lalibela%2C_Ethiopia_%283298418137%29.jpg"
        }
      ],
      models: [
        {
          title: "Church of St. George in Lalibela, Ethiopia",
          embed: "https://sketchfab.com/models/54a014ba8ad849b48625377347b6144a/embed",
          page: "https://sketchfab.com/3d-models/church-of-st-george-in-lalibela-ethiopia-54a014ba8ad849b48625377347b6144a",
          author: "Ben Kreimer",
          license: "CC BY 4.0"
        }
      ],
      tours: [],
      sources: [
        {
          url: "https://www.wikidata.org/wiki/Q642979",
          label: "wikidata.org"
        },
        {
          url: "https://nominatim.openstreetmap.org/search?q=Lalibela+churches%2C+Ethiopia&format=jsonv2",
          label: "nominatim.openstreetmap.org"
        },
        {
          url: "https://whc.unesco.org/en/list/18/",
          label: "whc.unesco.org"
        },
        {
          url: "https://en.wikipedia.org/wiki/Rock-Hewn_Churches,_Lalibela",
          label: "en.wikipedia.org"
        },
        {
          url: "https://en.wikipedia.org/wiki/Lalibela",
          label: "en.wikipedia.org"
        },
        {
          url: "https://www.wikidata.org/wiki/Q207590",
          label: "wikidata.org"
        }
      ],
      report: "world"
    },
    {
      id: "petra",
      nameRu: "Петра",
      nameEn: "Petra",
      country: "Jordan",
      countryRu: "Иордания",
      lat: 30.328611,
      lon: 35.441944,
      kind: "tomb",
      wow: null,
      card: "Петра наполовину построена и наполовину вырезана в скале. В I веке н. э. здесь, по оценке, жило около 20 тысяч человек, а в 2019 году сайт принял 1,2 миллиона гостей.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Al-Siq%2C_Petra%2C_Jordan5.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Al-Siq%2C_Petra%2C_Jordan5.jpg?width=360",
          author: "Diego Delso",
          license: "CC BY-SA 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3AAl-Siq%2C_Petra%2C_Jordan5.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Petra%2C_Siq%2C_Jordan.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Petra%2C_Siq%2C_Jordan.jpg?width=360",
          author: "Vyacheslav Argenberg",
          license: "CC BY 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3APetra%2C_Siq%2C_Jordan.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Petra_Siq%2C_entrance_to_the_ancient_Nabatean_city_of_Petra%2C_Jordan.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Petra_Siq%2C_entrance_to_the_ancient_Nabatean_city_of_Petra%2C_Jordan.jpg?width=360",
          author: "Vyacheslav Argenberg",
          license: "CC BY 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3APetra_Siq%2C_entrance_to_the_ancient_Nabatean_city_of_Petra%2C_Jordan.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/El_monasterio_-_Flickr_-_yoprogramador.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/El_monasterio_-_Flickr_-_yoprogramador.jpg?width=360",
          author: "Sergio Fernández from Madrid, Spain",
          license: "CC BY-SA 2.0",
          page: "https://commons.wikimedia.org/wiki/File%3AEl_monasterio_-_Flickr_-_yoprogramador.jpg"
        }
      ],
      models: [
        {
          title: "The Royal Tombs - Petra, Jordan",
          embed: "https://sketchfab.com/models/61213892f70544f192c1d6fa29a19e98/embed",
          page: "https://sketchfab.com/models/61213892f70544f192c1d6fa29a19e98",
          author: "GlobalDigitalHeritage",
          license: "CC BY-NC"
        },
        {
          title: "The Great Temple - Petra, Jordan",
          embed: "https://sketchfab.com/models/35ba08e72ed949659f229ac7739d95fb/embed",
          page: "https://sketchfab.com/models/35ba08e72ed949659f229ac7739d95fb",
          author: "GlobalDigitalHeritage",
          license: "CC BY-NC"
        }
      ],
      tours: [],
      sources: [
        {
          url: "https://en.wikipedia.org/wiki/Petra",
          label: "en.wikipedia.org"
        },
        {
          url: "https://whc.unesco.org/en/list/326/",
          label: "whc.unesco.org"
        },
        {
          url: "https://jordantimes.com/news/local/petra-nears-one-million-visitors-in-2023",
          label: "jordantimes.com"
        }
      ],
      report: "world"
    },
    {
      id: "montreal-underground",
      nameRu: "Подземный город Монреаля",
      nameEn: "Underground City, Montreal",
      country: "Canada",
      countryRu: "Канада",
      lat: 45.503,
      lon: -73.572,
      kind: "city",
      wow: null,
      card: "Зимой подземным Монреалем, по оценке, пользуется хорошо больше полумиллиона человек в день: статья называет 32 км тоннелей. Рядом в том же тексте две разные площади — 12 км² и 4 млн м².",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Ville_souterraine_de_Montreal_04.JPG?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Ville_souterraine_de_Montreal_04.JPG?width=360",
          author: "Jeangagnon",
          license: "CC BY-SA 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3AVille_souterraine_de_Montreal_04.JPG"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Complexe_Desjardins%2C_tunnel_towards_Place_des_Arts_2005-10-22..JPG?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Complexe_Desjardins%2C_tunnel_towards_Place_des_Arts_2005-10-22..JPG?width=360",
          author: "No machine-readable author provided. Gene.arboit assumed (based on copyright claims).",
          license: "CC BY-SA 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3AComplexe_Desjardins%2C_tunnel_towards_Place_des_Arts_2005-10-22..JPG"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Eaton_Center_inside.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Eaton_Center_inside.jpg?width=360",
          author: "Alexcaban on en.Wikipédia Antaya upload on Commons",
          license: "Public domain",
          page: "https://commons.wikimedia.org/wiki/File%3AEaton_Center_inside.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Montreal_11_db.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Montreal_11_db.jpg?width=360",
          author: "not stated in Commons metadata",
          license: "CC BY-SA 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3AMontreal_11_db.jpg"
        }
      ],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://en.wikipedia.org/wiki/Underground_City,_Montreal",
          label: "en.wikipedia.org"
        }
      ],
      report: "world"
    },
    {
      id: "toronto-path",
      nameRu: "PATH, Торонто",
      nameEn: "PATH, Toronto",
      country: "Canada",
      countryRu: "Канада",
      lat: 43.65,
      lon: -79.38,
      kind: "city",
      wow: null,
      card: "PATH в Торонто — это больше 30 км подземных переходов, и в рабочий день по ним проходит больше 200 тысяч человек. Город пишет о 3,7 млн квадратных футов торговли, а Википедия — о 371 600 м²: цифры разные.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/TunnelEatons.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/TunnelEatons.jpg?width=360",
          author: "William James",
          license: "Public domain",
          page: "https://commons.wikimedia.org/wiki/File%3ATunnelEatons.jpg"
        }
      ],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://www.wikidata.org/wiki/Q917121",
          label: "wikidata.org"
        },
        {
          url: "https://www.toronto.ca/path/",
          label: "toronto.ca"
        },
        {
          url: "https://en.wikipedia.org/wiki/Path_(Toronto)",
          label: "en.wikipedia.org"
        },
        {
          url: "https://commons.wikimedia.org/wiki/File:TunnelEatons.jpg",
          label: "commons.wikimedia.org"
        }
      ],
      report: "world"
    },
    {
      id: "helsinki-underground",
      nameRu: "Подземные места Хельсинки",
      nameEn: "Helsinki underground places",
      country: "Finland",
      countryRu: "Финляндия",
      lat: 60.17296,
      lon: 24.925227,
      kind: "temple",
      wow: null,
      card: "Церковь Темппелиаукио в 1969 году вырубили в гранитном холме, и в 2025 году у неё было около полумиллиона посетителей. Отдельного подземного города Хельсинки, как в Монреале, в проверенных страницах нет; ещё один подземный объект — бассейн Итякескус, открытый в 1993 году.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Temppeliaukio_Church_3.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Temppeliaukio_Church_3.jpg?width=360",
          author: "Pertsaboy",
          license: "CC BY-SA 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3ATemppeliaukio_Church_3.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Interior_of_Temppeliaukio_Church_20180802.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Interior_of_Temppeliaukio_Church_20180802.jpg?width=360",
          author: "Suicasmo",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3AInterior_of_Temppeliaukio_Church_20180802.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Temppeliaukio_Church_interior_02.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Temppeliaukio_Church_interior_02.jpg?width=360",
          author: "Ad Meskens",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3ATemppeliaukio_Church_interior_02.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Temppeliaukio_church_interior.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Temppeliaukio_church_interior.jpg?width=360",
          author: "Ypsilon from Finland",
          license: "CC0",
          page: "https://commons.wikimedia.org/wiki/File%3ATemppeliaukio_church_interior.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Uimahalli_It%C3%A4keskus.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Uimahalli_It%C3%A4keskus.jpg?width=360",
          author: "Gregorius",
          license: "CC BY-SA 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3AUimahalli_It%C3%A4keskus.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Itis_uimahalli_sis%C3%A4ll%C3%A4.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Itis_uimahalli_sis%C3%A4ll%C3%A4.jpg?width=360",
          author: "Gregorius",
          license: "CC BY-SA 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3AItis_uimahalli_sis%C3%A4ll%C3%A4.jpg"
        }
      ],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://en.wikipedia.org/wiki/Helsinki_Metro",
          label: "en.wikipedia.org"
        },
        {
          url: "https://www.hel.fi/en/urban-environment-and-traffic/urban-planning-and-construction/planning-and-building-goals/the-underground-master-plan",
          label: "hel.fi"
        },
        {
          url: "https://en.wikipedia.org/wiki/Temppeliaukio_Church",
          label: "en.wikipedia.org"
        },
        {
          url: "https://www.wikidata.org/wiki/Q5490394",
          label: "wikidata.org"
        }
      ],
      report: "world"
    },
    {
      id: "whity-umeda",
      nameRu: "Whity Umeda",
      nameEn: "Whity Umeda",
      country: "Japan",
      countryRu: "Япония",
      lat: 34.70304,
      lon: 135.499511,
      kind: "city",
      wow: null,
      card: "Под Умэдой в Осаке с 29 ноября 1963 года работает подземный торговый город Whity. Площадь в квадратных метрах на официальной английской странице не указана.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Whity-Umeda_in_201408.JPG?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Whity-Umeda_in_201408.JPG?width=360",
          author: "Mc681",
          license: "CC BY-SA 4.0",
          page: "https://commons.wikimedia.org/wiki/File%3AWhity-Umeda_in_201408.JPG"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Whity_Umeda%2C_Umeda_underground_city_-_panoramio.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Whity_Umeda%2C_Umeda_underground_city_-_panoramio.jpg?width=360",
          author: "DVMG",
          license: "CC BY 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3AWhity_Umeda%2C_Umeda_underground_city_-_panoramio.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Whity_Umeda_-_panoramio.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Whity_Umeda_-_panoramio.jpg?width=360",
          author: "DVMG",
          license: "CC BY 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3AWhity_Umeda_-_panoramio.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Whity_Umeda_-_panoramio_(5).jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Whity_Umeda_-_panoramio_(5).jpg?width=360",
          author: "DVMG",
          license: "CC BY 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3AWhity_Umeda_-_panoramio_%285%29.jpg"
        }
      ],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://nominatim.openstreetmap.org/search?q=Whity+Umeda%2C+Osaka&format=jsonv2",
          label: "nominatim.openstreetmap.org"
        },
        {
          url: "https://www.wikidata.org/wiki/Q11287453",
          label: "wikidata.org"
        },
        {
          url: "https://en.whity.osaka-chikagai.jp/",
          label: "en.whity.osaka-chikagai.jp"
        }
      ],
      report: "world"
    },
    {
      id: "crysta-nagahori",
      nameRu: "Crysta Nagahori",
      nameEn: "Crysta Nagahori",
      country: "Japan",
      countryRu: "Япония",
      lat: 34.67516,
      lon: 135.502788,
      kind: "city",
      wow: null,
      card: "Кристу Нагахори открыли 21 мая 1997 года как подземную торговую улицу под Нагахори в Осаке. Адрес на сайте — Южный Семба, подземная улица Нагахори; площадь в цифрах там не попалась.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Crysta-Nagahori1.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Crysta-Nagahori1.jpg?width=360",
          author: "not stated in Commons metadata",
          license: "CC BY-SA 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3ACrysta-Nagahori1.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Crysta-Nagahori2.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Crysta-Nagahori2.jpg?width=360",
          author: "not stated in Commons metadata",
          license: "CC BY-SA 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3ACrysta-Nagahori2.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/CRYSTA_Nagahori_-_panoramio_-_Nagono.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/CRYSTA_Nagahori_-_panoramio_-_Nagono.jpg?width=360",
          author: "Nagono",
          license: "CC BY-SA 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3ACRYSTA_Nagahori_-_panoramio_-_Nagono.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/LOTTERIA_CRYSTA_NAGAHORI_store_on_10th_November_2012.JPG?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/LOTTERIA_CRYSTA_NAGAHORI_store_on_10th_November_2012.JPG?width=360",
          author: "Tokumeigakarinoaoshima",
          license: "CC0",
          page: "https://commons.wikimedia.org/wiki/File%3ALOTTERIA_CRYSTA_NAGAHORI_store_on_10th_November_2012.JPG"
        }
      ],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://nominatim.openstreetmap.org/search?q=Crysta+Nagahori%2C+Osaka&format=jsonv2",
          label: "nominatim.openstreetmap.org"
        },
        {
          url: "https://www.wikidata.org/wiki/Q11299217",
          label: "wikidata.org"
        }
      ],
      report: "world"
    },
    {
      id: "yaesu",
      nameRu: "Яэтика",
      nameEn: "Yaesu Shopping Mall (Yaechika)",
      country: "Japan",
      countryRu: "Япония",
      lat: 35.680167,
      lon: 139.769472,
      kind: "city",
      wow: null,
      card: "Под токийским вокзалом со стороны Яэсу с декабря 1958 года работает торговый подвал Яэтика, на первом и втором подземных этажах. Общую площадь сайт в прочитанном тексте не назвал.",
      photos: [
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Yaesu_shopping_mall_entrance_tokyo_station_2009.JPG?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Yaesu_shopping_mall_entrance_tokyo_station_2009.JPG?width=360",
          author: "User:Kentin",
          license: "CC BY-SA 3.0",
          page: "https://commons.wikimedia.org/wiki/File%3AYaesu_shopping_mall_entrance_tokyo_station_2009.JPG"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Yaesu_Chikagai.JPG?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Yaesu_Chikagai.JPG?width=360",
          author: "Abasaa",
          license: "Public domain",
          page: "https://commons.wikimedia.org/wiki/File%3AYaesu_Chikagai.JPG"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Yaesu_Shopping_Mall_20200607_145833.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Yaesu_Shopping_Mall_20200607_145833.jpg?width=360",
          author: "Pcs34560 from jawp This photo was taken with Canon EOS 6D",
          license: "Public domain",
          page: "https://commons.wikimedia.org/wiki/File%3AYaesu_Shopping_Mall_20200607_145833.jpg"
        },
        {
          src: "https://commons.wikimedia.org/wiki/Special:FilePath/Automatic_Shoe_Shine_Machine_at_Tokyo_station_Yaesu_Chikagai_2007.jpg?width=1000",
          thumb: "https://commons.wikimedia.org/wiki/Special:FilePath/Automatic_Shoe_Shine_Machine_at_Tokyo_station_Yaesu_Chikagai_2007.jpg?width=360",
          author: "Kohei Uesaka",
          license: "CC BY 2.0",
          page: "https://commons.wikimedia.org/wiki/File%3AAutomatic_Shoe_Shine_Machine_at_Tokyo_station_Yaesu_Chikagai_2007.jpg"
        }
      ],
      models: [],
      tours: [],
      sources: [
        {
          url: "https://www.wikidata.org/wiki/Q10892516",
          label: "wikidata.org"
        },
        {
          url: "https://www.yaechika.com/",
          label: "yaechika.com"
        },
        {
          url: "https://en.wikipedia.org/wiki/Yaechika_Shopping_Mall",
          label: "en.wikipedia.org"
        }
      ],
      report: "world"
    }
  ];

  // src/glyphs.ts
  var GLYPHS = {
    city: "M-6,6 V0 A3,3 0 0 1 0,0 A3,3 0 0 1 6,0 V6 Z M-6,6 H6 M-6,-4 H6",
    cave: "M-8,6 L-3,-5 L0,0 L3,-6 L8,6 Z M-2,6 Q0,1 2,6",
    mine: "M-7,-3 Q0,-9 7,-3 M0,-6 V7 M-3,7 H3",
    crystal: "M0,-8 L5,-2 L3,6 L-3,6 L-5,-2 Z M0,-8 L0,6 M-5,-2 L5,-2",
    temple: "M-7,-2 L0,-8 L7,-2 Z M-5,-1 V5 M0,-1 V5 M5,-1 V5 M-7,7 H7",
    bunker: "M-7,6 V-1 Q0,-8 7,-1 V6 Z M-2,6 V1 H2 V6",
    ice: "M0,-8 V8 M-7,-4 L7,4 M-7,4 L7,-4",
    dwellings: "M-6,6 V-1 L0,-7 L6,-1 V6 Z M-1.5,6 V1.5 H1.5 V6",
    tomb: "M-4,7 V-3 Q0,-9 4,-3 V7 Z M-4,2 H4"
  };

  // src/data/miniatures.json
  var miniatures_default = { "cliff-dwelling": ["M346.951 24.582L299.193 72.34l-101.136-7.024-40.97 80.737 68.688 25.35 37.153-19.936 8.511 15.861-44.293 23.768-79.7-29.416-70.19 55.341 35.117 58.995-.375.2 13.014 21.585 29.134 2.361 55.06-35.123 9.679 15.176-60.16 38.377-44.364-3.596-18.23-30.234-56.8 30.586 33.712 61.804-33.713 40.735L18 444.177V494h170.62l-5.6-45.592a260.658 260.658 0 0 1-5.147-4.512c-4.186-3.761-5.89-5.444-8.027-7.484l-73.13 21.797-21.339-20.484 12.467-12.985 13.777 13.225 73.068-21.78 3.784 3.667s4.24 4.09 9.216 8.636l37.797-37.248 8.133 79.54 6.3-93.444 10.364 28.387 6.281-45.112 3.14-3.091-.29-.233 22.486-27.974.465-.907.188.096 11.453-14.248 14.03 11.277-9.122 11.348 67.803 34.715 27.008-9.489 22.478 17.71 22.924-12.036 8.367 15.938-33.262 17.46-23.875-18.81-24.964 8.772-9.584-4.907 39.04 87.842L383.923 494H494v-28.512L462.713 478.2l-6.776-16.678L494 446.06V211.176l-23.438-26.463-21.654-67.371-33.547 32.666-107.77-13.873-28.019-29.096 12.967-12.486 23.629 24.539 92.867 11.953 31.442-30.615-52.79-61.801zm27.53 177.74l34.177 41.428 28.863-6.56-4.136-13.59 17.22-5.243 9.77 32.098-58.543 13.307-31.377-38.033-33.086 19.853-9.262-15.436z"], "underground-city": ["M297 41v30h78V41h-78zM80 48c-12.56 22.13-19.5 54.6-22.07 77.2-.59.2-1.17.5-1.74.7-5.58-17.9-17.63-33.58-33.8-46.62 6.47 18.29 15.93 35.52 19.71 54.62-4.23 2.9-8.01 6-11.3 9.4-3.16 3.3-5.68 14.2-5.9 27.1-.17 12.9 1.1 27 .1 38.4v18.3c24.32-9.1 49.03-21.4 74.63-31.3 29.77-11.6 61.07-19.5 94.17-12.6h.1c25.2 5.3 41.1 10.6 62.8 29.4 37.2-26.3 84.7-42.1 129.8-29.3L487 212.1v-29.8c-5.8-2.2-11.7-4.3-17.5-6.4 4.6-25.7 12-44.4 24.2-71.2-21.1 17.4-40.5 31.6-50.4 51.9 2.4-20.1-7.9-28.1-25.5-45.7 5.2 21.2 3.8 30.9-2.2 46.8-74.1-23.5-146.1-39.7-208.1-45.9-18.3-1.8-35.7-2.8-51.9-2.8-2.3 0-4.6.1-6.9.1-16.4.2-31.7 1.4-45.6 3.5-2.8-11.8-.4-25.02 11.9-40.56C98.7 83.9 84.47 96.35 76.54 110.5 76.33 90.05 78.65 68.87 80 48zm233 41v22.1c15.1 3.4 30.5 7.1 46 11.3V89h-46zm41.6 107.9c-32.5-.4-66 13.7-93.2 34.3l-6 4.5-5.5-5.1c-19.2-18-29.3-22.8-47.8-27.2-2.9 9.7-9.2 19.9-14.6 30 .5-10.4 1.6-21-5.6-29.5-3 8.8-10.3 16.5-24 22.6 2.9-9.9 6.9-19 6.9-27.8-19.5.6-38.9 6.2-58.7 13.8-26.37 10.2-53.15 24.2-81.1 34V487h462V230.8l-105.5-30.1c-8.8-2.5-17.8-3.7-26.9-3.8zM384 215c40.2 0 73 32.8 73 73s-32.8 73-73 73-73-32.8-73-73 32.8-73 73-73zm-9 18.7c-23.3 3.8-41.5 22.1-45.3 45.3H375v-45.3zm18 0V279h45.3c-3.8-23.2-22-41.5-45.3-45.3zM160 247c57.9 0 105 47.1 105 105 0 27.4-10.5 52.3-27.7 71H249v50H71v-50h11.71C65.52 404.3 55 379.4 55 352c0-57.9 47.1-105 105-105zm0 18c-9 0-17.7 1.4-25.9 3.9l-8.5 44-3.6-39.2c-29.06 14-49 43.8-49 78.3 0 29.4 14.41 55.3 36.6 71h71.3l7.3-44.6 7.3 44.6h14.9c22.2-15.7 36.6-41.6 36.6-71 0-48.2-38.8-87-87-87zm169.7 32c3.8 23.2 22 41.5 45.3 45.3V297h-45.3zm63.3 0v45.3c23.3-3.8 41.5-22.1 45.3-45.3H393zm-175 45a9.999 9.999 0 0 1 10 10 9.999 9.999 0 0 1-10 10 9.999 9.999 0 0 1-10-10 9.999 9.999 0 0 1 10-10zm61 49h194v50h-16v32h-50v-32h-62v32h-50v-32h-16v-50zm18 18v14h158v-14H297zM89 441v14h142v-14H89zm224 0v14h14v-14h-14zm112 0v14h14v-14h-14z"], cave: ["M25 25v94.1c29.99.1 62.76-.7 90.3 21.3l2.6 2 24.7 122.3 31.7-151.4 11 7.2c23.2 15.1 41.4 9.7 58.8-.3l11.4-6.6 15.8 103.9 19.5-92.2 17.6-.2 17.8 74.9 12.7-112.32 13.6 19.92c8.3 12.1 14.5 21.1 20.6 26.7 5.4 5 10.6 7.7 18.9 8.7 13.4-8.4 27.8-20.7 44.4-30.1 14.6-8.4 31.7-14.23 50.6-11.9V25H25zm417.6 338.7c-12 10.6-25.5 26.2-39.7 41.6-16.5 17.8-33.7 35.2-53.9 42.3l-3.2 1.1-3.2-1.3c-32.5-13.1-72.9-11.6-115.6-6.5l-2.5.3-2.3-1c-26.1-11.8-42.9-23-75.3-34.2-7 12.3-16.4 23.4-27.2 30.8-6.4 4.4-13.4 7.6-20.86 8.5-7.47 1-15.51-.7-22.15-5.5-10.43-7.5-20.87-18-31.23-25.6-7.49-5.4-14.3-8.8-20.46-9.7V487h462v-37.2c-5.1-12.7-12.2-31.1-20.8-48.7-7.2-14.9-15.8-28.8-23.6-37.4z"], "salt-mine": ["M403.818 33.117l-369.554 15.4v46.012L426.97 79.425l-23.152-46.31zM385.334 99.04l-30.408 1.17 9.78 185.806 38.554-7.71L385.334 99.04zm-135.152 5.198l-18.39.71-2.694 15.61-26.578 18.75.13.866-.273-.047-3.063 17.738 6.188 1.07 4.617 30.395 31.532 5.445 14.543-27.088 6.186 1.07 3.063-17.74-.273-.046.416-.773-18.75-26.578 3.346-19.382zm-77.444 2.98l-22.82.878-39.47 54.775-1.692 33.138 63.982-88.79zm-77.625 2.985l-31.275 1.203-28.72 272.832 45.66 6.733 14.335-280.767zM236.928 128.1l14.457 20.49-34.947-6.035 20.49-14.455zm-20.516 32.718l28.87 4.985-7.012 13.064-19.63-3.39-2.228-14.66zM437.12 289.89l-76.434 15.288-44.99-14.998-28.706 28.703h169.457L437.12 289.89zm-260.05 2.268l-9.42 20.725h-16.386v18h8.205l-7.275 16h-22.93v18h14.75l-8.183 18h-26.568v18h18.386l-13.636 30h-24.75v18h16.568l-8.762 19.275 16.387 7.45 12.147-26.725h143.423l-6.75-18H133.785l13.637-30h103.605l-6.75-18h-88.673l8.18-18h73.74l-6.75-18h-58.807l7.273-16h45.535l-4.498-12h41.258l6-6h-80.113l6.035-13.276-16.387-7.45zm69.182 44.725l40.36 107.635c6.022-8.242 15.748-13.635 26.652-13.635 11.916 0 22.43 6.438 28.234 16h55.53c5.804-9.562 16.32-16 28.236-16 10.424 0 19.768 4.93 25.832 12.564l26.64-106.564H246.252zm67.012 112c-8.39 0-15 6.61-15 15s6.61 15 15 15 15-6.61 15-15-6.61-15-15-15zm112 0c-8.39 0-15 6.61-15 15s6.61 15 15 15 15-6.61 15-15-6.61-15-15-15z"], crystal: ["M253.8 15.56l-79.9 84.11 2.3 58.83 50.6 36.2 31.9 182 10.8-26.9 11.8-235.4 18.7 1-9.1 181 28.3-70.8 8.2-108 .9-17.93zm139 50.57l-46.6 50.77-3.9 51.1 10.6-26.2 30.4-13.7c3.2-20.6 6.3-41.3 9.5-61.97zm60.3 51.17l-85.7 38.4-102.6 255.9 14.6 83.3h7.8l147.6-293.1 16.7 8.4-143.4 284.7h24.4l146.6-291.8zm-340.2 18.9l-54.11 99.1 69.11 259.6h93.6l-51.1-274.8 18.3-3.4 51.8 278.2h19.9l-50.7-289.4zm358.3 260.4l-65.8-5.2-49.8 99.2 69.8-36.7zm-435.96-28l42.47 126.7h30.99L80.6 389.9z"], temple: ["M247 23.82v18.71c-50.7 3.94-87.9 40.63-93.2 77.67h204.5C353 83.16 315.7 46.46 265 42.53V23.82zM153.1 138.2v16.3c3.2 1.7 5.9 4.2 7.7 6.8 3.3 4.9 5 10.5 6.1 16.1 2.1 11.4 2.2 20.5 2.2 31.8v71H183v-78l.8-18c2.6-14.8 11.6-26.7 23.2-34.5 8.5-5.7 18.3-9.4 28.6-11.5zm123.3 0c10.3 2.1 20.1 5.8 28.6 11.5 11.6 7.8 20.6 19.7 23.2 34.5l.8 18v78h14v-71c0-10.7.3-22.5 2.2-31.8 1.1-5.6 2.8-11.2 6.1-16.1 1.8-2.6 4.5-5.1 7.7-6.8v-16.3zm-20.4 16c-14.5 0-28.9 3.8-39 10.5-7.6 5-12.8 11.2-14.9 19.5h107.8c-2.1-8.3-7.3-14.5-14.9-19.5-10.1-6.7-24.5-10.5-39-10.5zm-111.3 16.1c-11.9 1.7-26.8 8.9-38 17.5-5.3 4.1-9.79 8.5-12.9 12.4h57.1c-.1-6.5-.5-13.4-1.6-19.2-1.1-3.6-1.7-8.4-4.6-10.7zm222.7 0c-2.6 2.3-4 7.7-4.6 10.7-1.1 5.8-1.5 12.7-1.6 19.2h57c-3.1-3.9-7.5-8.3-12.9-12.4-11.2-8.6-26-15.8-37.9-17.5zM201 202.2v78h9c.8-.7 1.6-1.4 2.4-2 3-2.4 6.2-4.5 9.6-6.3v-34.7c0-8 6-12 12-12s12 4 12 12v27.6c3.2-.4 6.5-.6 10-.6s6.8.2 10 .6v-27.6c0-8 6-12 12-12s12 4 12 12v34.7c3.4 1.8 6.6 3.9 9.6 6.3.8.6 1.6 1.3 2.4 2h9v-78zm-112 16v62h62.1v-62zm272 0v62h62v-62zm-237 7c6 0 12 4 12 12v32h-24v-32c0-8 6-12 12-12zm264 0c6 0 12 4 12 12v32h-24v-32c0-8 6-12 12-12zm-132 57c-14.5 0-24 3.3-32.4 10-8.4 6.7-15.8 17.6-23.5 33l-2.5 5H137v30h238v-30h-60.7l-2.5-5c-7.7-15.4-15.1-26.3-23.5-33-8.4-6.7-17.8-10-32.3-10zm-176 16c-13 0-22.25 6.2-28.97 14.6-3.88 4.9-6.49 10.5-8.12 15.4H119v-16h67.6c2.7-5 5.4-9.7 8.2-14zm237.1 0c2.8 4.3 5.5 9 8.2 14H393v16h76.1c-1.6-4.9-4.2-10.5-8.1-15.4-6.7-8.4-16-14.6-29-14.6zM41 346.2v46h31.89c1.36-3.2 3.34-6.1 5.56-8.6 4.13-4.8 9.31-8.8 14.92-12.1 8.23-4.9 17.13-8.7 25.63-10.4v-14.9zm352 0v14.9c8.5 1.7 17.4 5.5 25.6 10.4 5.6 3.3 10.8 7.3 15 12.1 2.2 2.5 4.2 5.4 5.5 8.6H471v-46zm-265 32c-5 0-16.6 3.4-25.4 8.7-2.74 1.7-5.11 3.5-7.2 5.3h321.2c-2.1-1.8-4.5-3.6-7.2-5.3-8.8-5.3-20.4-8.7-25.4-8.7zm-89.51 32l-10 30H87v-30H71zm66.51 0v78h94.1c.7-28.4 4.6-50.6 12.8-67 2-4 4.4-7.7 7.1-11zm151 0c-13 0-21 5.2-27.9 19-6.3 12.5-10 32.5-10.8 59h77.5c-.6-26.7-3.4-47-9.1-59.2-6.3-13.7-13.8-18.8-29.7-18.8zm39.1 0c2.7 3.3 5 7.1 6.9 11.2 7.7 16.7 10.5 38.7 10.9 66.8H407v-78zm129.9 0v30h58.5l-10-30H441zm-293 11c6 0 12 4 12 12v32h-24v-32c0-8 6-12 12-12zm40 0c6 0 12 4 12 12v32h-24v-32c0-8 6-12 12-12zm168 0c6 0 12 4 12 12v32h-24v-32c0-8 6-12 12-12zm40 0c6 0 12 4 12 12v32h-24v-32c0-8 6-12 12-12zm-355 37v30h62v-30zm400 0v30h62v-30z"], tomb: ["M352.439 16c-13.706 0-27.648 4.42-37.556 14.329-14.902 14.901-46.253 44.313-49.274 79.17-5.46 3.315-9.656 5.903-13.948 9.3 1.678 5.632 3.362 11.99 5.059 19.002 9.216-5.835 17.617-13.17 26.212-17.48v-5.445c0-25.453 28.748-56.425 44.411-72.088 5.755-5.755 15.306-9.167 25.096-9.167 9.79 0 19.342 3.412 25.097 9.167 15.664 15.663 44.41 46.635 44.41 72.088v5.445c8.544 6.418 31.008 14.725 31.327 25.882 0 29.858-7.758 88.926-15.595 151.625-7.652 61.215-15.305 126.061-15.665 173.746-22.479 5.784-48.236 6.435-69.574 6.499-23.344-.391-68.57 1.299-69.604-8.33-5.46 2.258-11.332 4.516-17.434 6.73 1.22 6.768 7.17 10.262 12.594 12.137 24.122 6.556 51.81 7.042 74.444 7.084 26.263.188 63.506 2.71 81.83-10.745 2.361-1.764 5.298-5.163 5.298-9.813 0-46.011 7.77-112.511 15.597-175.12 7.826-62.61 15.73-121.018 15.73-153.813-3.675-18.088-17.12-28.442-31.625-36.704-3.021-34.857-34.37-64.269-49.272-79.17C380.09 20.42 366.144 16 352.44 16zM112.362 41.727l7.39 23.382 30.1-9.514c-11.566-7.066-24.638-14.923-37.49-13.868zM95.56 47.038c-12.856 7.763-17.49 20.987-22.71 32.897l30.102-9.514zm256.88 13.995c-2.667 0-5.285.426-7.803 1.223l35.952 20.142c-5.211-12.91-16.197-21.365-28.15-21.365zM168.38 68.218l-19.376 6.126c8.938 6.506 16.965 15.835 21.583 23.98l20.197-6.385c-5.016-8.596-13.24-16.622-22.404-23.721zm160.727 5.54c-4.918 6.642-7.996 15.462-7.996 25.454 0 2.356.181 4.64.507 6.853h61.64c.09-.609.168-1.223.234-1.843zm-205.212 9.82c-2.478-.079-4.9.252-7.233.99-7.468 2.36-13.278 8.658-16.53 18.283-3.252 9.625-3.512 22.258.526 35.03 4.037 12.773 11.51 22.963 19.703 28.97 8.194 6.007 16.567 7.821 24.035 5.46 7.467-2.36 13.28-8.66 16.531-18.284 3.252-9.625 3.51-22.256-.527-35.029-4.038-12.773-11.509-22.964-19.702-28.971-5.633-4.13-11.352-6.277-16.803-6.45zM84.32 94.791l-19.376 6.124c-3.419 11.076-5.536 22.37-4.7 32.287l20.195-6.385c-.46-11.578.273-22.475 3.881-32.026zm112.78 13.63l-19.62 6.203c4.795 15.788 4.672 31.636.142 45.042a54.25 54.25 0 0 1-4.745 10.348c10.363-4.754 34.617-15.45 35.73-25.187zm18.88 1.266l9.43 29.828c2.287 7.235-.577 14.536-4.78 19.912-1.217 1.557-2.581 3.04-4.053 4.478 6.337 23.68 4.684 48.605-1.245 68.52 18.99-.005 29.922 25.186 34.107 36.048l14.097-4.457c-11.004-59.96-21.062-115.988-29.78-143.566-3.803-5.86-11.54-8.72-17.776-10.763zm112.419 13.998c5.866 8.49 14.654 13.706 24.04 13.706 9.385 0 18.174-5.216 24.04-13.706zm-244.23 20.435l-19.617 6.2 11.506 36.406c10.671 6.133 31.671 2.456 43.717.072a54.252 54.252 0 0 1-9.831-5.738c-11.413-8.367-20.623-21.267-25.775-36.94zm296.2.946c-7.84 6.236-17.413 9.946-27.93 9.946-10.508 0-20.073-3.704-27.908-9.93-7.64 1.01-15.603 2.389-24.176 4.171l53.809 26.39 69.474-20.84c-.081-.43-.16-.865-.247-1.274-16.137-3.916-30.072-6.75-43.023-8.463zm-99.817 14.103c-1.249 9.685-1.344 22.962-.151 38.604l48.93-14.68zm-230.723 3.04c-4.06 5.287-10.291 12.253-8.362 19.023 8.721 27.578 32.692 79.208 58.15 134.599l132.973-42.033c-2.804-8.008-7.015-20.034-15.633-23.807l-76.992 24.339-3.24-1.683c-21.19-11.01-45.052-35.246-56.208-65.728-2.035-.33-4.01-.76-5.904-1.335-6.53-1.983-13.07-6.314-15.356-13.549zm375.446 10.5l-143.173 42.952c1.523 13.669 3.612 28.539 5.997 44.063l134.424-41.87c.768-6.696 1.418-13.144 1.899-19.235.757-9.608 1.03-18.333.853-25.91zm-224.215 2.718c-32.213 17.073-66.152 29.32-101.239 32 9.847 21.179 27.692 39.259 42.086 47.807l52.333-16.54c6.81-15.292 10.928-40.345 6.82-63.267zm219.03 61.645L290.87 277.319c2.35 14.567 4.865 29.51 7.36 44.505l115.175-40.83c2.382-14.72 4.865-30.724 6.683-43.921zm-153.328 44.405l-159.75 50.495a6141.77 6141.77 0 0 1 6.551 14.36l156.09-49.34a6136.956 6136.956 0 0 1-2.891-15.515zm143.38 19.37l-26.4 9.359 21.655 19.227a25654.83 25654.83 0 0 1 4.746-28.587zm-137.185 13.58l-37.767 11.94 40.257 127.347c8.896-3.99 17.86-7.17 25.875-12.998.459-.339.379-.327.694-.604-10.606-34.457-20.192-79.526-29.059-125.685zm91.818 2.501l-63.63 22.557c2.571 15.774 5.003 31.406 7.103 46.549l90.615-38.836zM218.39 331.677l-42.939 13.574 40.58 128.376c14.928-4.09 29.296-8.646 42.939-13.573zm-59.742 18.885L120.882 362.5c19.274 42.87 37.332 85.26 48.457 119.553.418.045.346.082.916.095 10.343-.335 19.264-2.117 28.648-4.235zm240.874 15.524l-77.007 33.004 32.512 25.742 39.097-19.549c1.514-12.638 3.356-25.78 5.398-39.197zm-86.69 47.815c4.931 18.596 4.823 18.121 7.482 28.289l17.313-8.658zm79.084 12.191l-59.996 29.996c6.13 1.524 13.32 2.406 20.52 2.406 10.769 0 21.578-1.937 28.728-5.115 11.92-4.327 9.946-17.216 10.748-27.287z"], ruins: ["M277.822 18l-33.46 5.637 20.41 20.41 42.12-5.5L457.26 171.332l8.892 52.78-188.006-57.487-8.16 12.145L494 247.27v-65.372L321.695 18h-43.873zm-55.242 9.307L42.775 57.597l-14.457 47.276 195.346 59.732c3.162-2.613 6.453-5.325 12.973-10.673L71.084 103.31l34.695-36.474 2.195-2.31L242.262 46.99l-19.682-19.68zm78.53 30.146l-20.282 2.65 23.832 23.83-32.492 10.833 46.45 11.61-29.983 44.634 154.928 47.373-2.995-17.778-139.46-123.152zm-42.794 5.59L116.626 81.55l-12.427 13.063 149.204 45.625c10.38-8.434 21.128-17.107 30.07-24.093l-75.64-18.91 63.506-21.17-13.024-13.022zM148.13 164.598l-26.595 26.595-11.867-23.734-14.95 44.843-27.23-40.846L53.434 424.46c34.415 5.734 70.622 6.06 109.13-.075L148.13 164.598zm-5.134 43.134l6 202-17.992.536-6-202 17.992-.536zm-69.992.004l17.992.528-6 204-17.992-.528 6-204zM99 208h18v208H99V208zm310 57v42.73c15.296 4.103 50.7 4.374 85 3.99V265h-85zm-21.236 64c-3.1 2.538-6.47 4.89-10.202 6.822-6.376 3.302-14.134 5.18-22.37 3.875-4.783-.758-9.604-2.636-14.467-5.408L327.155 375H439v-46h-51.236zM457 329v46h37v-46h-37zm-185.658 17.377c-8.592 4.21-16.74 8.066-23.008 13.033-5.09 4.035-9.18 8.75-12.11 15.59h78.05l-42.932-28.623zM237.104 393c6.465 18.295 8.62 33.21 8.447 46H247v-46h-9.896zM265 393v46h110v-46H265zm186.73 0l-46.003 46H494v-46h-42.27zM195 442.203c-36.733 4.718-73.905 6.542-111.535 5.186l-3.414 4.45 35.934 6.764-34.38 29.76c38.292 1.366 76.09-.08 113.396-4.42v-41.74zm-174 .014v41.69c11.597 1.292 23.148 2.323 34.656 3.113l20.36-17.624-28.067-5.283 13.704-17.867c-13.492-.93-27.042-2.254-40.654-4.03zM243.748 457c-2.055 11.088-5.47 20.656-8.2 30H311v-30h-67.252zM329 457v30h110v-30H329zm128 0v30h37v-30h-37z"], pyramid: ["M217 25v14h78V25h-78zm0 32v46h14V71h50v32h14V57h-78zm32 32v14h14V89h-14zm-64 32v46h30v-46h-30zm48 0v14h46v-14h-46zm64 0v46h30v-46h-30zm-64 32v14h46v-14h-46zm-80 32v46h62v-46h-62zm80 0v14h46v-14h-46zm64 0v46h62v-46h-62zm-64 32v14h46v-14h-46zm-112 32v46h94v-46h-94zm112 0v14h46v-14h-46zm64 0v46h94v-46h-94zm-64 32v14h46v-14h-46zM89 313v46h126v-46H89zm144 0v14h46v-14h-46zm64 0v46h126v-46H297zm-64 32v14h46v-14h-46zM57 377v46h158v-46H57zm176 0v14h46v-14h-46zm64 0v46h158v-46H297zm-64 32v14h46v-14h-46zM25 441v46h190v-46H25zm208 0v14h46v-14h-46zm64 0v46h190v-46H297zm-64 32v14h46v-14h-46z"], stupa: ["M255.967 23.386c19.704 15.157 49.792 21.65 82.52 27.105 21.419 3.57 43.864 6.501 65.163 9.832-7.28 1.686-14.641 3.4-21.609 4.97-21.25 4.789-41 8.38-45.967 8.321H175.8l-.168.006c-4.61.172-24.44-3.34-45.662-8.181-7.035-1.605-14.48-3.364-21.842-5.09 21.346-3.342 43.848-6.279 65.32-9.858 32.727-5.454 62.815-11.948 82.52-27.105zm55 67.228v16h-110v-16zm3.394 34a24.977 24.977 0 0 0 4.563 4.28c3.799 2.763 8.317 4.922 13.701 7.076 10.768 4.307 24.987 8.332 41.158 12.375 18.612 4.653 39.434 9.269 60.069 13.865l-50.182 8.404H128.71l-50.54-8.424c20.606-4.59 41.396-9.2 59.98-13.845 16.172-4.043 30.39-8.068 41.159-12.375 5.384-2.154 9.902-4.313 13.7-7.076a24.977 24.977 0 0 0 4.563-4.28zm28.606 62v30h-46v-30zm-64 0v30h-46v-30zm-64 0v30h-46v-30zm131.123 48c1.246 1.65 2.68 3.113 4.156 4.422 3.592 3.184 8.04 6.026 13.383 8.965 10.686 5.877 24.947 11.954 41.178 18.041 20.082 7.531 43.024 14.894 65.33 21.42l-54.914 9.152H96.263l-54.533-9.133c22.327-6.53 45.294-13.9 65.397-21.439 16.23-6.087 30.492-12.164 41.178-18.041 5.343-2.939 9.79-5.781 13.382-8.965 1.477-1.309 2.91-2.772 4.157-4.422zm28.877 80v30h-238v-30zm3.123 48c1.246 1.65 2.68 3.113 4.156 4.422 3.592 3.184 8.04 6.026 13.383 8.965 10.686 5.877 24.947 11.954 41.178 18.041 20.102 7.539 43.07 14.909 65.396 21.44l-54.533 9.132H64.71l-54.913-9.152c22.305-6.526 45.247-13.889 65.33-21.42 16.23-6.087 30.492-12.164 41.178-18.041 5.343-2.939 9.79-5.781 13.382-8.965 1.477-1.309 2.91-2.772 4.157-4.422zm60.877 80v46h-142v-46zm-160 0v46h-46v-46zm-64 0v46h-142v-46z"], "canyon-city": ["M483.5 57l-10 30h-147l-10-30zm-288 0l-10 30h-147l-10-30zm260.4 48l30.2 302H445l-.2-210-32.8-73.1-32.8 73.1-.2 210h-18V199h-26.3l9.4-94zm-288 0l9.4 94H151v208h-18l-.2-210-32.8-73.1L67.2 197 67 407H25.9l30.2-302zM412 164.1l9.4 18.9h-18.8zm-312 0l9.4 18.9H90.6zM427 201v206h-30V201zm-312 0v206H85V201zm228 16v30H169v-30zm0 48v142h-30V295H199v112h-30V265zm144 160v62H342.1l-24.8-62zm-189.1 0l8.4 21H205.7l8.4-21zm-103.2 0l-24.8 62H25v-62zm118.8 39l9.2 23H189.3l9.2-23z"] };

  // src/strings.ts
  var dict = {
    pageTitle: { ru: "Чудериус — путешествие по чудесам мира", en: "Wonderius — a journey through the wonders of the world" },
    title: { ru: "Чудериус", en: "Wonderius" },
    tagline: { ru: "Атлас чудес мира", en: "An atlas of the world's wonders" },
    hint: { ru: "Тыкай в значок на карте", en: "Tap a pin on the map" },
    introInspired: {
      ru: "Вдохновлено книгой «Карты» Александры и Даниэля Мизелиньских: мы взяли у неё дух и приёмы, рисунки у нас свои.",
      en: 'Inspired by the book "Maps" by Aleksandra and Daniel Mizielinski: we took its spirit and ideas; the drawings are our own.'
    },
    enter: { ru: "Открыть атлас", en: "Open the atlas" },
    random: { ru: "Случайное чудо", en: "Random wonder" },
    footer: {
      ru: "Фото и материалы принадлежат авторам: у каждого указаны автор, лицензия и источник. Данные собраны из открытых источников, где цифры расходятся, это отмечено.",
      en: "Photos and materials belong to their authors: author, licence and source are shown. Data comes from open sources; where figures disagree, it is noted."
    },
    iconsCredit: { ru: "Значки: Delapouite и Lorc, game-icons.net, CC BY 3.0.", en: "Icons: Delapouite and Lorc, game-icons.net, CC BY 3.0." },
    prev: { ru: "Назад", en: "Back" },
    next: { ru: "Дальше", en: "Next" },
    onCommons: { ru: "страница на Wikimedia Commons", en: "page on Wikimedia Commons" },
    photos: { ru: "Фотографии", en: "Photos" },
    model3d: { ru: "3D-модель", en: "3D model" },
    open: { ru: "Открыть", en: "Open" },
    model: { ru: "модель", en: "model" },
    tour: { ru: "Виртуальная прогулка", en: "Virtual walk" },
    sources: { ru: "Откуда это известно", en: "Where this comes from" },
    photoBy: { ru: "Фото", en: "Photo" },
    noAuthor: { ru: "автор не указан", en: "author not stated" },
    noPhoto: { ru: "Свободного фото пока нет.", en: "No freely licensed photo yet." },
    source: { ru: "источник", en: "source" },
    close: { ru: "Закрыть", en: "Close" },
    textRuOnly: { ru: "", en: "The story is in Russian for now; an English text is coming." }
  };

  // src/i18n.ts
  var STORE_KEY = "lruns-lang";
  function readStore() {
    try {
      const v = window.localStorage.getItem(STORE_KEY);
      return v === "ru" || v === "en" ? v : null;
    } catch {
      return null;
    }
  }
  function fromBrowser() {
    const tags = [...navigator.languages || [], navigator.language].filter(Boolean);
    return tags.some((t2) => t2.toLowerCase().startsWith("ru")) ? "ru" : "en";
  }
  var lang = readStore() || fromBrowser();
  function t(key) {
    return dict[key][lang];
  }
  function setLang(next) {
    try {
      window.localStorage.setItem(STORE_KEY, next);
    } catch {
    }
    window.location.reload();
  }

  // src/card.ts
  function esc(s) {
    return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  }
  function showCard(el, place, onClose) {
    const first = place.photos[0];
    const hero = first ? `<img class="hero" id="hero" src="${esc(first.src)}" alt="${esc(placeName(place))}">` : `<div class="hero"></div>`;
    const thumbs = place.photos.length > 1 ? `<h3>${t("photos")}</h3><div class="thumbs">${place.photos.map((p, i) => `<button data-i="${i}" title="${esc(p.author)}"><img src="${esc(p.thumb)}" loading="lazy" alt=""></button>`).join("")}</div>` : "";
    const credit = first ? `<div class="credit-line" id="credit">${creditHtml(first)}</div>` : `<div class="credit-line">${t("noPhoto")}</div>`;
    const models = place.models.length ? `<h3>${t("model3d")}</h3>${place.models.map((m, i) => `<button class="btn" data-model="${i}">${t("open")}: ${esc(m.title || t("model"))}</button>
           <div class="credit-line">${esc(m.author)}, ${esc(m.license)}, <a href="${esc(m.page)}" target="_blank" rel="noopener">${t("source")}</a></div>`).join("")}<div id="viewer"></div>` : "";
    const tours = place.tours.length ? `<h3>${t("tour")}</h3>${place.tours.map((t2) => `<a class="btn ghost" href="${esc(t2.url)}" target="_blank" rel="noopener">${esc(t2.provider.slice(0, 40))}</a>`).join("")}` : "";
    const sources = place.sources.length ? `<h3>${t("sources")}</h3><ul class="sources">${place.sources.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`).join("")}</ul>` : "";
    el.innerHTML = `<button class="close" aria-label="${t("close")}">×</button>${hero}
    <div class="body">
      <h2>${esc(placeName(place))}</h2>
      <div class="meta">${esc(lang === "ru" ? place.nameEn : place.nameRu)} · ${esc(placeCountry(place))}</div>
      ${credit}
      <p class="text">${esc(place.card)}</p>${lang === "en" ? `<div class="credit-line">${t("textRuOnly")}</div>` : ""}
      ${thumbs}${models}${tours}${sources}
    </div>`;
    el.hidden = false;
    el.scrollTop = 0;
    el.querySelector(".close")?.addEventListener("click", () => {
      el.hidden = true;
      onClose();
    });
    let current = 0;
    el.querySelector("#hero")?.addEventListener("click", () => openPhoto(place, current));
    el.querySelectorAll(".thumbs button").forEach(
      (b) => b.addEventListener("click", () => {
        current = Number(b.dataset.i);
        const p = place.photos[current];
        el.querySelector("#hero")?.setAttribute("src", p.src);
        const c = el.querySelector("#credit");
        if (c) c.innerHTML = creditHtml(p);
        openPhoto(place, current);
      })
    );
    el.querySelectorAll("[data-model]").forEach(
      (b) => b.addEventListener("click", () => {
        const m = place.models[Number(b.dataset.model)];
        const v = el.querySelector("#viewer");
        if (v) v.innerHTML = `<div class="viewer"><iframe title="3D" allow="autoplay; fullscreen; xr-spatial-tracking" allowfullscreen src="${esc(m.embed)}"></iframe></div>`;
      })
    );
  }
  function creditHtml(p) {
    return `${t("photoBy")}: ${esc(p.author || t("noAuthor"))}, ${esc(p.license)}, <a href="${esc(p.page)}" target="_blank" rel="noopener">Wikimedia Commons</a>`;
  }
  function placeName(p) {
    return lang === "ru" ? p.nameRu : p.nameEn;
  }
  function placeCountry(p) {
    return lang === "ru" ? p.countryRu : p.country;
  }
  function openPhoto(place, start2) {
    const lb = document.getElementById("lb");
    let i = start2;
    const draw = () => {
      const p = place.photos[i];
      lb.innerHTML = `<button class="lb-close" aria-label="${t("close")}">×</button>
      <div class="lb-box"><img src="${esc(p.src)}" alt="${esc(placeName(place))}">
        <div class="lb-info"><b>${esc(placeName(place))}</b>
          ${t("photoBy")}: ${esc(p.author || t("noAuthor"))}, ${esc(p.license)}.
          <a href="${esc(p.page)}" target="_blank" rel="noopener">${t("onCommons")}</a>
          ${place.photos.length > 1 ? `<div class="lb-nav"><button data-d="-1">${t("prev")}</button><span>${i + 1} / ${place.photos.length}</span><button data-d="1">${t("next")}</button></div>` : ""}
        </div></div>`;
      lb.querySelector(".lb-close")?.addEventListener("click", close);
      lb.querySelectorAll("[data-d]").forEach((b) => b.addEventListener("click", (e) => {
        e.stopPropagation();
        i = (i + Number(b.dataset.d) + place.photos.length) % place.photos.length;
        draw();
      }));
    };
    const close = () => {
      lb.hidden = true;
      lb.innerHTML = "";
      document.removeEventListener("keydown", onKey);
    };
    const onKey = (e) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        i = (i + (e.key === "ArrowRight" ? 1 : -1) + place.photos.length) % place.photos.length;
        draw();
      }
    };
    lb.onclick = (e) => {
      if (e.target === lb) close();
    };
    document.addEventListener("keydown", onKey);
    lb.hidden = false;
    draw();
  }

  // src/main.ts
  var places = places_default;
  var W = 1600;
  var H = 860;
  var CONTINENT_COLORS = {
    Europe: ["#e8c9a0", "#ebd3a8", "#e2bf94"],
    Asia: ["#e7d28b", "#ecd994", "#dfc67e"],
    Africa: ["#e9b98a", "#eec195", "#e2ae7c"],
    "North America": ["#b9d6a0", "#c4dca9", "#aecb95"],
    "South America": ["#a8d1b4", "#b4d8bf", "#9bc6a8"],
    Oceania: ["#e6a9a0", "#ebb5ac", "#dd9c93"]
  };
  var CONTINENT_LABELS = [
    ["Европа", "Europe", 14, 52],
    ["Азия", "Asia", 90, 48],
    ["Африка", "Africa", 20, 4],
    ["Северная Америка", "North America", -105, 46],
    ["Южная Америка", "South America", -60, -14],
    ["Океания", "Oceania", 135, -26]
  ];
  function hash(s) {
    let h = 0;
    for (let i = 0; i < s.length; i += 1) h = h * 31 + s.charCodeAt(i) | 0;
    return Math.abs(h);
  }
  var projection2 = naturalEarth1_default().fitExtent([[40, 30], [W - 40, H - 40]], { type: "Sphere" });
  var path = path_default(projection2);
  var stage = document.getElementById("stage");
  var svg = select_default2(stage).append("svg").attr("viewBox", `0 0 ${W} ${H}`).attr("preserveAspectRatio", "xMidYMid slice");
  var defs = svg.append("defs");
  defs.append("pattern").attr("id", "waves").attr("width", 28).attr("height", 14).attr("patternUnits", "userSpaceOnUse").append("path").attr("d", "M0,8 q7,-6 14,0 t14,0").attr("fill", "none").attr("stroke", "#9bbbb0").attr("stroke-width", 0.8).attr("opacity", 0.55);
  var root2 = svg.append("g");
  root2.append("path").attr("class", "sea").attr("d", path({ type: "Sphere" }));
  root2.append("path").attr("d", path({ type: "Sphere" })).attr("fill", "url(#waves)");
  root2.append("path").attr("class", "grat").attr("d", path(graticule10()));
  var countries = world_default.features;
  var landLayer = root2.append("g");
  for (const f of countries) {
    const palette = CONTINENT_COLORS[f.properties["континент"]] ?? CONTINENT_COLORS.Europe;
    landLayer.append("path").attr("class", "country").attr("d", path(f)).attr("fill", palette[hash(f.properties.iso3) % palette.length]);
  }
  var labelLayer = root2.append("g");
  for (const [ru, en, lon, lat] of CONTINENT_LABELS) {
    const p = projection2([lon, lat]);
    if (p) labelLayer.append("text").attr("class", "cont-label").attr("x", p[0]).attr("y", p[1]).attr("text-anchor", "middle").text(lang === "ru" ? ru : en);
  }
  var DECOR = [
    // kind, lon, lat, size in map units
    ["pyramid", -90, 17, 34],
    ["pyramid", -76, -11, 34],
    ["cliff-dwelling", -110, 36, 30],
    ["ruins", 22, 39.5, 30],
    ["tomb", 32, 22, 28],
    ["canyon-city", 45, 24, 30],
    ["stupa", 101, 15, 30],
    ["stupa", 88, 26, 28],
    ["temple", 126, 36, 28],
    ["underground-city", 2, 28, 28],
    ["cave", 140, -26, 30],
    ["salt-mine", 70, 56, 28]
  ];
  var decorLayer = root2.append("g").attr("class", "decor").style("pointer-events", "none");
  for (const [kind, lon, lat, size] of DECOR) {
    const paths = miniatures_default[kind];
    const pt = projection2([lon, lat]);
    if (!paths || !pt) continue;
    const g = decorLayer.append("g").attr("transform", `translate(${pt[0] - size / 2},${pt[1] - size / 2}) scale(${size / 512})`);
    for (const d of paths) g.append("path").attr("d", d);
  }
  var pinLayer = root2.append("g");
  var card = document.getElementById("card");
  var currentId = null;
  var pins = places.map((place) => {
    const [x, y] = projection2([place.lon, place.lat]);
    const r = place.wow !== null && place.wow <= 5 ? 17 : 13;
    const g = pinLayer.append("g").attr("class", "pin").attr("data-id", place.id);
    g.append("ellipse").attr("class", "shadow").attr("cx", 2).attr("cy", r - 2).attr("rx", r * 0.8).attr("ry", r * 0.3);
    g.append("circle").attr("class", "ring").attr("r", r + 5);
    g.append("circle").attr("class", "disc").attr("r", r);
    g.append("path").attr("class", "glyph").attr("d", GLYPHS[place.kind]).attr("transform", `scale(${r / 11})`);
    g.append("text").attr("class", "name").attr("x", r + 6).attr("y", 4).text(placeName(place));
    g.on("click", (ev) => {
      ev.stopPropagation();
      selectPlace(place.id);
    });
    return { place, x, y, r, g };
  });
  var k = 1;
  function layoutPins() {
    const shown = [];
    const order = [...pins].sort((a, b) => (a.place.wow ?? 50) - (b.place.wow ?? 50));
    for (const pin of order) {
      const sx = pin.x * k, sy = pin.y * k;
      const clash = shown.some(([x, y]) => Math.hypot(x - sx, y - sy) < 30);
      if (!clash) shown.push([sx, sy]);
      pin.g.classed("dot", clash && pin.place.id !== currentId).attr("transform", `translate(${pin.x},${pin.y}) scale(${1 / k})`);
    }
  }
  var zoomer = zoom_default2().scaleExtent([1, 40]).translateExtent([[-200, -100], [W + 200, H + 100]]).on("zoom", (ev) => {
    root2.attr("transform", ev.transform.toString());
    k = ev.transform.k;
    decorLayer.attr("opacity", Math.min(0.5, 0.22 + (k - 1) * 0.1));
    layoutPins();
  });
  svg.call(zoomer);
  svg.on("dblclick.zoom", null);
  function selectPlace(id2) {
    const place = places.find((p) => p.id === id2);
    if (!place) return;
    currentId = id2;
    pinLayer.selectAll("g.pin").classed("on", (_d, i, nodes) => nodes[i].getAttribute("data-id") === id2);
    showCard(card, place, () => {
      currentId = null;
      pinLayer.selectAll("g.pin").classed("on", false);
      layoutPins();
    });
    layoutPins();
  }
  function flyTo(id2) {
    const pin = pins.find((p) => p.place.id === id2);
    if (!pin) return;
    const scale = 6;
    const t2 = identity2.translate(W / 2 - pin.x * scale, H / 2 - pin.y * scale).scale(scale);
    svg.transition().duration(900).call(zoomer.transform, t2);
  }
  document.getElementById("random")?.addEventListener("click", () => {
    const others = places.filter((p) => p.id !== currentId);
    const pick = others[Math.floor(Math.random() * others.length)];
    selectPlace(pick.id);
    flyTo(pick.id);
  });
  svg.on("click", () => {
  });
  layoutPins();
  var fromHash = decodeURIComponent(location.hash.slice(1));
  if (fromHash) selectPlace(fromHash);
  decorLayer.attr("opacity", 0.22);
  document.title = t("pageTitle");
  document.documentElement.lang = lang;
  var setText = (id2, text) => {
    const el = document.getElementById(id2);
    if (el) el.textContent = text;
  };
  setText("h1", t("title"));
  setText("tagline", `${t("tagline")}. ${t("hint")}.`);
  setText("random", t("random"));
  setText("credit", `${t("footer")} ${t("iconsCredit")}`);
  setText("introTitle", t("title"));
  setText("introTag", t("tagline"));
  setText("enter", t("enter"));
  setText("introNote", t("introInspired"));
  var langBtn = document.getElementById("lang");
  langBtn.textContent = lang === "ru" ? "EN" : "RU";
  langBtn.addEventListener("click", () => setLang(lang === "ru" ? "en" : "ru"));
  var head = document.getElementById("head");
  function leaveIntro() {
    document.body.classList.remove("intro-on");
    window.setTimeout(() => head.classList.add("min"), 1200);
  }
  if (fromHash) {
    leaveIntro();
  } else {
    document.getElementById("enter")?.addEventListener("click", leaveIntro);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === "Escape") leaveIntro();
    }, { once: true });
  }
})();
